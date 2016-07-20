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

        $affected_agent_ids = [];
        $due_date_changed = $old_project && $old_project->due_at && $old_project->due_at->ne($new_project->due_at);

        // Should rebuild timeline
        if ($new_project->shouldRebuildOwnersTimeline()) {
            $affected_agent_ids[] = $new_project->getAgentId();
        }

        // Due date changed - get all agents that have tasks in this project and update their timeline
        if ($due_date_changed) {
            // + because we want unique agent ids. array_merge will keep duplicates.
            $affected_agent_ids = $affected_agent_ids + $new_project->incomplete_tasks->pluck('agent_id');
        }

        foreach ($affected_agent_ids as $agent_id) {
            TimelineBuilder::createTimeline($agent_id);
        }

    }

}
