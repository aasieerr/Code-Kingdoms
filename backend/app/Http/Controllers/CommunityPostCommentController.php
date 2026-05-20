<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\CommunityPostComment;
use App\Support\PublicStorage;
use Illuminate\Http\Request;

class CommunityPostCommentController extends Controller
{
    public function index(Request $request, int $postId)
    {
        $perPage = min(max((int) $request->integer('per_page', 20), 1), 50);
        $viewerId = $request->user()?->id;

        $comments = CommunityPostComment::query()
            ->where('community_post_id', $postId)
            ->with(['user:id,name,avatar_path'])
            ->orderBy('created_at')
            ->paginate($perPage);

        return response()->json([
            'data' => $comments->getCollection()->map(fn (CommunityPostComment $comment) => $this->formatComment($comment, $viewerId))->values(),
            'meta' => [
                'current_page' => $comments->currentPage(),
                'last_page' => $comments->lastPage(),
                'per_page' => $comments->perPage(),
                'total' => $comments->total(),
            ],
        ]);
    }

    public function store(Request $request, int $postId)
    {
        $validated = $request->validate([
            'body' => 'required|string|max:500',
        ]);

        $post = CommunityPost::query()->findOrFail($postId);

        $comment = CommunityPostComment::create([
            'community_post_id' => $post->id,
            'user_id' => $request->user()->id,
            'body' => trim($validated['body']),
        ]);

        $comment->load('user:id,name,avatar_path');

        return response()->json([
            'message' => 'Comentario publicado.',
            'comment' => $this->formatComment($comment, $request->user()->id),
        ], 201);
    }

    public function destroy(Request $request, int $id)
    {
        $comment = CommunityPostComment::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        $comment->delete();

        return response()->json(['message' => 'Comentario eliminado.']);
    }

    private function formatComment(CommunityPostComment $comment, ?int $viewerId = null): array
    {
        return [
            'id' => $comment->id,
            'post_id' => $comment->community_post_id,
            'author' => $comment->user?->name ?? 'HÉROE ANÓNIMO',
            'author_avatar_url' => $comment->user?->avatar_path
                ? PublicStorage::url($comment->user->avatar_path)
                : null,
            'body' => $comment->body,
            'created_at' => $comment->created_at?->toIso8601String(),
            'is_mine' => $viewerId !== null && $viewerId === $comment->user_id,
        ];
    }
}
