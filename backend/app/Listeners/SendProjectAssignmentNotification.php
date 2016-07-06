<?php

namespace App\Listeners;

use App\Events\ProjectChanged;
use Illuminate\Support\Facades\Mail;

class SendProjectAssignmentNotification {
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
     * @param  ProjectChanged $event
     * @return void
     */
    public function handle(ProjectChanged $event) {

        $new_project = $event->new_project;
        $old_project = $event->old_project;

        // Send notification to new assignee
        if (!$old_project || $new_project->agent_id !== $old_project->agent_id) {

            $new_agent = $new_project->agent;

            Mail::send(['text' => 'emails.project_assigned'], ['project' => $new_project, 'agent' => $new_agent], function ($m) use ($new_project, $new_agent) {
                $m->subject('Project Assigned to You: ' . $new_project->full_name);
                $m->from('projects@faithpromise.org', 'Faith Promise Church');
                $m->to($new_agent->email, $new_agent->name);
            });

        }

    }

}
