<?php

namespace App\Events;

use App\Models\Comment;
use Illuminate\Queue\SerializesModels;

class CommentCreated extends Event {
    use SerializesModels;

    public $comment;

    /**
     * Create a new event instance.
     *
     * @return void
     */
    public function __construct(Comment $comment) {
        $this->comment = $comment;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn() {
        return [];
    }
}
