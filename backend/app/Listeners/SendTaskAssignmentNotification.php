<?php

namespace App\Listeners;

use App\Events\TaskChanged;
use Illuminate\Support\Facades\Mail;

class SendTaskAssignmentNotification {
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
     * @param  TaskChanged $event
     * @return void
     */
    public function handle(TaskChanged $event) {

        $new_task = $event->new_task;
        $old_task = $event->old_task;

        // Send notification to new assignee
        if (!$old_task || $new_task->agent_id !== $old_task->agent_id) {

            $new_agent = $new_task->agent;

            Mail::send(['text' => 'emails.task_assigned'], ['task' => $new_task, 'agent' => $new_agent], function ($m) use ($new_task, $new_agent) {
                $m->subject('Task Assigned to You: ' . $new_task->full_name);
                $m->from('projects@faithpromise.org', 'Faith Promise Church');
                $m->to($new_agent->email, $new_agent->name);
            });

        }

    }

}