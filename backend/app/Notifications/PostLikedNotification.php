<?php

namespace App\Notifications;

use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class PostLikedNotification extends Notification implements ShouldBroadcast
{
    use Queueable;

    public $liker;
    public $post;

    public function __construct(User $liker, CommunityPost $post)
    {
        $this->liker = $liker;
        $this->post = $post;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'post_id' => $this->post->id,
            'liker_id' => $this->liker->id,
            'liker_name' => $this->liker->name,
            'liker_avatar' => $this->liker->avatar_url,
            'message' => "¡A {$this->liker->name} le ha gustado tu publicación!",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
            'type' => 'PostLikedNotification',
            'created_at' => now()->toIso8601String(),
        ]);
    }
}
