<?php

namespace App\Listeners;

use App\Events\ProjectCreated;
use App\Models\Task;
use App\Services\TimelineBuilder;

class CreateDefaultProjectTasks {
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
     * @param  ProjectCreated $event
     * @return void
     */
    public function handle(ProjectCreated $event) {

        $project = $event->project;

        if ($project->shouldCreateSetupTask()) {
            $task = new Task();
            $task->setProjectId($project->id);
            $task->setAgentId($project->getAgentId());
            $task->setName('Meeting / Set Up Project');
            $task->setDuration(30);
            $task->setSort(1);
            $task->save();
        }

        if ($project->shouldCreateCloseTask()) {
            $task = new Task();
            $task->setProjectId($project->id);
            $task->setAgentId($project->getAgentId());
            $task->setName('Close Out Project');
            $task->setDuration(15);
            $task->save();
        }

        if (isset($task)) {
            TimelineBuilder::createTimeline($project->getAgentId());
        }

    }
}
