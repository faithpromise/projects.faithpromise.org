<?php

namespace App\Listeners;

use App\Events\TaskSaved;

class UpdateProjectEstimateSent {
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

        if ($new_task->getType() === 'estimate' && $completed_changed) {
            $new_task->project->setEstimateSentAt($new_task->getCompletedAt())->save();
        }

    }

}