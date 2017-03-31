<?php

namespace App\Listeners;

use App\Events\TaskSaved;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
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
     * @param  TaskSaved $event
     * @return void
     */
    public function handle(TaskSaved $event) {

        $new_task = $event->new_task;
        $old_task = $event->old_task;

        /** @var User $current_user */
        $current_user = Auth::user();

        $current_user_is_task_owner = $current_user->getId() === $new_task->agent_id;
        $agent_did_not_change = $old_task && ($new_task->agent_id === $old_task->agent_id);

        // Don't send if...
        if ($current_user_is_task_owner || $agent_did_not_change) {
            return;
        }

        // Send notification to new assignee
        $new_agent = $new_task->agent;
        
        Mail::send(['text' => 'emails.task_assigned'], ['task' => $new_task, 'agent' => $new_agent], function ($m) use ($new_task, $new_agent) {
            $m->subject('Task Assigned to You: ' . $new_task->full_name);
            $m->from('projects@faithpromise.org', 'Faith Promise Church');
            $m->to($new_agent->email, $new_agent->name);
        });

    }

}