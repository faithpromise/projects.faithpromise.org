<?php

namespace App\Listeners;

use App\Events\ProjectSaved;
use App\Models\Project;
use App\Models\Task;
use App\Services\TimelineBuilder;

class AutoCreatePurchaseTask {
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

        $now_requires_purchase = $new_project->is_purchase && (!$old_project || !$old_project->is_purchase);
        $no_longer_requires_purchase = !$new_project->is_purchase && ($old_project && $old_project->is_purchase);

        if ($now_requires_purchase) {
            $task = new Task();
            $task->setProjectId($new_project->id);
            $task->setAgentId($new_project->getAgentId());
            $task->setName('Place Order');
            $task->setType('purchase');
            $task->setDueAt(null);
            $task->setDuration(30);
            $task->setSort(99999);
            $task->save();

            TimelineBuilder::createTimeline($new_project->getAgentId());
        }

        if ($no_longer_requires_purchase) {
            Task::where('project_id', '=', $new_project->id)->where('type', '=', 'purchase')->delete();
            TimelineBuilder::createTimeline($new_project->getAgentId());
        }

    }

}
