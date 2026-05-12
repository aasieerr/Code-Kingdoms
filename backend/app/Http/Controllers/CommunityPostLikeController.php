<?php

namespace App\Http\Controllers;

use App\Models\CommunityPost;
use App\Models\CommunityPostLike;
use Illuminate\Http\Request;

class CommunityPostLikeController extends Controller
{
    public function toggle(Request $request, int $postId)
    {
        $post = CommunityPost::query()->findOrFail($postId);

        $existingLike = CommunityPostLike::query()
            ->where('community_post_id', $post->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingLike) {
            $existingLike->delete();
            $liked = false;
        } else {
            CommunityPostLike::create([
                'community_post_id' => $post->id,
                'user_id' => $request->user()->id,
            ]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $post->likes()->count(),
        ]);
    }
}
