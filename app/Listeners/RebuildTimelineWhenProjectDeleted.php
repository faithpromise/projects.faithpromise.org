<?php

namespace App\Listeners;

use App\Events\ProjectDeleted;
use App\Models\Project;
use App\Services\TimelineBuilder;

class RebuildTimelineWhenProjectDeleted {
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
     * @param  ProjectDeleted $event
     * @return void
     */
    public function handle(ProjectDeleted $event) {

        /** @var Project $project */
        $project = $event->project;

        TimelineBuilder::createTimeline($project->getAgentId());

    }

}
