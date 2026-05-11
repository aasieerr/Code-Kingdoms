<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\Screenshot;
use App\Support\PublicStorage;
use Illuminate\Http\Request;

class CommunityPostController extends Controller
{
    public function index(Request $request)
    {
        $perPage = min(max((int) $request->integer('per_page', 12), 1), 30);

        $posts = CommunityPost::query()
            ->with(['user:id,name,avatar_path'])
            ->withCount(['likes', 'comments'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $viewerId = $request->user()?->id;
        $likedPostIds = [];

        if ($viewerId !== null) {
            $likedPostIds = CommunityPost::query()
                ->whereIn('id', $posts->getCollection()->pluck('id'))
                ->whereHas('likes', fn ($query) => $query->where('user_id', $viewerId))
                ->pluck('id')
                ->all();
        }

        return response()->json([
            'data' => $posts->getCollection()->map(
                fn (CommunityPost $post) => $this->formatPost($post, $viewerId, in_array($post->id, $likedPostIds, true))
            )->values(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'screenshot_id' => 'nullable|integer|exists:screenshots,id',
            'caption' => 'nullable|string|max:500',
            'faction' => 'nullable|string|in:PHP,JAVA',
        ]);

        $caption = trim((string) ($validated['caption'] ?? ''));
        $screenshotId = $validated['screenshot_id'] ?? null;

        if ($screenshotId === null && $caption === '') {
            return response()->json([
                'message' => 'Escribe una crónica o selecciona una captura para publicar.',
            ], 422);
        }

        if ($screenshotId !== null) {
            $screenshot = Screenshot::query()
                ->where('user_id', $request->user()->id)
                ->findOrFail($screenshotId);

            if (CommunityPost::query()->where('screenshot_id', $screenshot->id)->exists()) {
                return response()->json([
                    'message' => 'Esta captura ya está publicada en la comunidad.',
                ], 422);
            }

            $post = CommunityPost::create([
                'user_id' => $request->user()->id,
                'screenshot_id' => $screenshot->id,
                'image_path' => $screenshot->image_path,
                'character_name' => $screenshot->character_name,
                'faction' => $validated['faction'] ?? null,
                'caption' => $caption !== '' ? $caption : null,
            ]);
        } else {
            $post = CommunityPost::create([
                'user_id' => $request->user()->id,
                'screenshot_id' => null,
                'image_path' => null,
                'character_name' => null,
                'faction' => $validated['faction'] ?? null,
                'caption' => $caption,
            ]);
        }

        $post->load('user:id,name,avatar_path');
        $post->loadCount(['likes', 'comments']);

        return response()->json([
            'message' => $screenshotId !== null
                ? 'Captura publicada en la comunidad.'
                : 'Crónica publicada en la comunidad.',
            'post' => $this->formatPost($post, $request->user()->id, false),
        ], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $post = CommunityPost::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $post->delete();

        return response()->json(['message' => 'Publicación eliminada de la comunidad.']);
    }

    private function formatPost(CommunityPost $post, ?int $viewerId = null, ?bool $viewerHasLiked = null): array
    {
        $likesCount = (int) ($post->likes_count ?? $post->likes()->count());
        $commentsCount = (int) ($post->comments_count ?? $post->comments()->count());

        if ($viewerHasLiked === null && $viewerId !== null) {
            $viewerHasLiked = $post->likes()->where('user_id', $viewerId)->exists();
        }

        return [
            'id' => $post->id,
            'author' => $post->user?->name ?? 'HÉROE ANÓNIMO',
            'author_avatar_url' => $post->user?->avatar_path
                ? PublicStorage::url($post->user->avatar_path)
                : null,
            'faction' => $post->faction ?? 'PHP',
            'character_name' => $post->character_name,
            'caption' => $post->caption,
            'image_url' => $post->image_path
                ? PublicStorage::url($post->image_path)
                : null,
            'has_image' => filled($post->image_path),
            'created_at' => $post->created_at?->toIso8601String(),
            'is_featured' => $post->is_featured,
            'is_mine' => $viewerId !== null && $viewerId === $post->user_id,
            'likes_count' => $likesCount,
            'comments_count' => $commentsCount,
            'viewer_has_liked' => (bool) $viewerHasLiked,
        ];
    }
}
