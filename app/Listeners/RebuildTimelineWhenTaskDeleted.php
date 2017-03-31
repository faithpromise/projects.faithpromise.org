<?php

namespace App\Listeners;

use App\Events\TaskDeleted;
use App\Services\TimelineBuilder;

class RebuildTimelineWhenTaskDeleted {
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
     * @param  TaskDeleted $event
     * @return void
     */
    public function handle(TaskDeleted $event) {

        $task = $event->task;

        // Rebuild timeline for assignee
        TimelineBuilder::createTimeline($task->agent);

    }

}