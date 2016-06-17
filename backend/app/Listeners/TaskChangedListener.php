<?php

namespace App\Listeners;

use App\Events\TaskChanged;
use App\Services\TimelineBuilder;

class TaskChangedListener {
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct() {
        //
    }

    /**
     * Handle the event.
     *
     * @param  TaskChanged $event
     * @return void
     */
    public function handle(TaskChanged $event) {
        TimelineBuilder::createTimeline($event->new_task->agent);

        if ($event->old_task && $event->old_task->agent_id !== $event->new_task->agent_id) {
            TimelineBuilder::createTimeline($event->old_task->agent);
        }
    }
}
