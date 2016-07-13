<?php

namespace App\Listeners;

use App\Events\ProjectCreated;
use App\Models\Project;
use App\Models\Task;
use App\Services\TimelineBuilder;
use Carbon\Carbon;

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

        /** @var Project $project */
        $project = $event->project;

        if ($project->shouldCreateSetupTask()) {
            $task = new Task();
            $task->setProjectId($project->id);
            $task->setAgentId($project->getAgentId());
            $task->setName('Meeting - Set Up Project');
            $task->setDueAt(Carbon::today()->addWeekdays(2)->endOfDay());
            $task->setDuration(30);
            $task->setSort(1);
            $task->save();
        }

        if ($project->shouldCreateEstimateTask() && $project->getIsPurchase()) {
            $task = new Task();
            $task->setProjectId($project->id);
            $task->setAgentId($project->getAgentId());
            $task->setName('Send ' . $project->requester->getFirstName() . ' an estimate');
            $task->setDueAt(Carbon::today()->addWeekdays(3)->endOfDay());
            $task->setDuration(30);
            $task->save();
        }

        if (isset($task)) {
            TimelineBuilder::createTimeline($project->getAgentId());
        }

    }
}
