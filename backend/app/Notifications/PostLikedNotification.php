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

    /**
     * Create a new notification instance.
     */
    public function __construct(User $liker, CommunityPost $post)
    {
        $this->liker = $liker;
        $this->post = $post;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Enviar a base de datos y por WebSocket a través de Reverb
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification for the database.
     *
     * @return array<string, mixed>
     */
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

    /**
     * Get the broadcast representation of the notification.
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'data' => $this->toArray($notifiable),
            'type' => 'PostLikedNotification',
            'created_at' => now()->toIso8601String(),
        ]);
    }
}
