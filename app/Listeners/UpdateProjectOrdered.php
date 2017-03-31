<?php

namespace App\Listeners;

use App\Events\TaskSaved;

class UpdateProjectOrdered {
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
     * @param  TaskSaved $event
     * @return void
     */
    public function handle(TaskSaved $event) {

        $new_task = $event->new_task;
        $old_task = $event->old_task;

        $completed_changed = !$old_task || ($old_task->isCompleted() !== $new_task->isCompleted());

        if ($new_task->getType() === 'purchase' && $completed_changed) {
            $new_task->project->setOrderedAt($new_task->getCompletedAt())->save();
        }

    }

}