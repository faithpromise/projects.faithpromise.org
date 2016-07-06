<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Queue\SerializesModels;

class TaskChanged extends Event {

    use SerializesModels;

    public $new_task;
    public $old_task;

    /**
     * Create a new event instance.
     *
     * @param Task $new_task
     * @param Task $old_task
     */
    public function __construct(Task $new_task, Task $old_task = null) {
        $this->new_task = $new_task;
        $this->old_task = $old_task;
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
