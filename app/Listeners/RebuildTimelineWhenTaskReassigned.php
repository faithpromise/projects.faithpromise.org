<?php

namespace App\Listeners;

use App\Events\TaskSaved;
use App\Services\TimelineBuilder;

class RebuildTimelineWhenTaskReassigned {
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
     * @param  TaskSaved $event
     * @return void
     */
    public function handle(TaskSaved $event) {

        $new_task = $event->new_task;
        $old_task = $event->old_task;

        // Rebuild timeline for new assignee
        if ($new_task->agent) {
            TimelineBuilder::createTimeline($new_task->agent);
        }

        // Rebuild timeline for old assignee
        if ($old_task && $old_task->agent_id && $old_task->agent_id !== $new_task->agent_id) {
            TimelineBuilder::createTimeline($old_task->agent);
        }

    }

}