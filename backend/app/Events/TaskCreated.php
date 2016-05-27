<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Queue\SerializesModels;

class TaskCreated extends Event {

    use SerializesModels;

    public $task;

    /**
     * Create a new event instance.
     *
     * @param Task $task
     */
    public function __construct(Task $task) {
        $this->task = $task;
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
