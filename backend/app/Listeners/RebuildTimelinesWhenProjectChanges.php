<?php

namespace App\Listeners;

use App\Events\ProjectSaved;
use App\Services\TimelineBuilder;

class RebuildTimelinesWhenProjectChanges {
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
     * @param  ProjectSaved $event
     * @return void
     */
    public function handle(ProjectSaved $event) {

        $new_project = $event->new_project;
        $old_project = $event->old_project;

        // Due date changed
        if ($old_project->due_at->ne($new_project->due_at)) {

            // Get all agents that have tasks in this project and update their timeline
            foreach ($new_project->incomplete_tasks->pluck('agent_id') as $agent_id) {
                TimelineBuilder::createTimeline($agent_id);
            }

        }

    }

}
