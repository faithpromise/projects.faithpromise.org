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
        TimelineBuilder::createTimeline($event->task->agent);
    }
}
