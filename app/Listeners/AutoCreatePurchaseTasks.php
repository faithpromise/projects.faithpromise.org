<?php

namespace App\Listeners;

use App\Events\ProjectSaved;
use App\Models\Project;
use App\Models\Task;
use App\Services\TimelineBuilder;

class AutoCreatePurchaseTasks {
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
     * @param ProjectSaved $event
     */
    public function handle(ProjectSaved $event) {

        /** @var Project $new_project */
        $new_project = $event->new_project;
        /** @var Project $old_project */
        $old_project = $event->old_project;

        $now_requires_purchase = $new_project->getIsPurchase() && (!$old_project || !$old_project->getIsPurchase());
        $no_longer_requires_purchase = !$new_project->getIsPurchase() && ($old_project && $old_project->getIsPurchase());

        if ($now_requires_purchase) {

            // Send estimate task
            if ($new_project->shouldCreateEstimateTask()) {
                $task = new Task();
                $task->setProjectId($new_project->id);
                $task->setAgentId($new_project->getAgentId());
                $task->setName('Send ' . $new_project->requester->getFirstName() . ' an estimate');
                $task->setType('estimate');
                $task->setDueAt($new_project->created_at->addWeekdays(3)->endOfDay());
                $task->setDuration(30);
                $task->setSort(99998);
                $task->save();
            }

            // Place order task
            $task = new Task();
            $task->setProjectId($new_project->id);
            $task->setAgentId($new_project->getAgentId());
            $task->setName('Place Order');
            $task->setType('purchase');
            $task->setDueAt(null);
            $task->setDuration(30);
            $task->setSort(99999);
            $task->save();
        }

        if ($no_longer_requires_purchase) {
            $task = Task::where('project_id', '=', $new_project->id)->whereIn('type', ['estimate','purchase'])->delete();
        }

        if (isset($task)) {
            $new_project->shouldRebuildOwnersTimeline(true);
        }

    }

}
