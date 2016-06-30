<?php

namespace App\Listeners;

use App\Events\TaskChanged;
use App\Services\TimelineBuilder;

class TaskChangedListener {
    /**
     * Create the event listener.
     *
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

        if ($event->new_task->agent) {
            TimelineBuilder::createTimeline($event->new_task->agent);
        }

        if ($event->old_task && $event->old_task->agent_id && $event->old_task->agent_id !== $event->new_task->agent_id) {
            dd($event->old_task);
            TimelineBuilder::createTimeline($event->old_task->agent);
        }
    }
}
