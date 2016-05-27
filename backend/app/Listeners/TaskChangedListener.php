<?php

namespace App\Listeners;

use App\Events\TaskCreated;
use App\Services\TimelineBuilder;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Contracts\Queue\ShouldQueue;

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
     * @param  TaskCreated $event
     * @return void
     */
    public function handle(TaskCreated $event) {
        TimelineBuilder::createTimeline($event->task->agent);
    }
}
