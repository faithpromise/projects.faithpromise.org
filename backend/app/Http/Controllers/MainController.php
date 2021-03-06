<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Project;
use App\Models\User;
use App\Services\TimelineBuilder;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Zendesk\API\HttpClient as ZendeskApi;

class MainController extends Controller {

    private $user_cache = [];

    public function index() {

        // TODO: Do not need to re-generate timeline on each request. This is just for dev
        $agents = Agent::with('tasks.project.event')->get();
        foreach ($agents as $agent) {
            TimelineBuilder::createTimeline($agent);
        }

        return view('welcome');
    }

    public function zendeskImport(Request $request) {

        $subdomain = 'faithpromise';
        $username = 'bradr@faithpromise.org';
        $token = 'WarsVQ3YbelNnVUbakvETnVgHZSKIkWeW21QntH8';

        $per_page = $request->input('perpage', 30);
        $page = $request->input('page', 1);
        $next_page = $page + 1;

        $api = new ZendeskApi($subdomain, $username);
        $api->setAuth('basic', ['username' => $username, 'token' => $token]);

        $data = $api->tickets()->findAll(['per_page' => $per_page, 'page' => $page]);

        $total_pages = (int)ceil($data->count / $per_page);

        foreach ($data->tickets as $z_ticket) {

            // Only for "Communications" group (we don't want Facilities tickets)
            if ($z_ticket->group_id === 26779538) {

                $agent_id = $this->getUserId($z_ticket->assignee_id, $api);
                $requester_id = $this->getUserId($z_ticket->requester_id, $api);

                $project = Project::firstOrNew(['zendesk_ticket_id' => $z_ticket->id]);

                $project->zendesk_ticket_id = $z_ticket->id;
                $project->setRequesterId($requester_id);
                $project->setAgentId($agent_id);
                $project->setName($z_ticket->subject);
                $project->setDueAt($z_ticket->due_at ? $z_ticket->due_at : Carbon::today()->addYears(1));
                $project->setIsBacklog(in_array('backlog', $z_ticket->tags));
                $project->created_at = new Carbon($z_ticket->created_at);
                $project->closed_at = $z_ticket->status === 'closed' ? (new Carbon($z_ticket->updated_at)) : null;
                $project->disableSetupTask();
                $project->disableAssignmentNotification();

                $project->save();

                $recipient_ids = [$requester_id, $agent_id];
                foreach ($z_ticket->collaborator_ids as $z_collaborator_id) {
                    $recipient_id = $this->getUserId($z_collaborator_id, $api);
                    if ($recipient_id) {
                        array_push($recipient_ids, $recipient_id);
                    }
                }

                $project->recipients()->sync($recipient_ids);

                // Comments
                $z_comments = $api->tickets($z_ticket->id)->comments()->findAll()->comments;

                foreach ($z_comments as $z_comment) {

                    $sender_id = $this->getUserId($z_comment->author_id, $api);

                    $comment = Comment::firstOrNew(['zendesk_comment_id' => $z_comment->id]);
                    $comment->zendesk_comment_id = $z_comment->id;
                    $comment->project_id = $project->id;
                    $comment->setType('comment');
                    $comment->setUserId($sender_id);
                    $comment->setBody($z_comment->body);
                    $comment->setSentAt($z_comment->created_at);
                    $comment->created_at = new Carbon($z_comment->created_at);
                    $comment->save();

                    if ($z_comment->public) {
                        $comment->syncRecipients($recipient_ids);
                    }

                    // Attachments
                    foreach ($z_comment->attachments as $z_attachment) {

                        if (!str_contains($z_attachment->file_name, ['image001','image002'])) {

                            $attachment = Attachment::firstOrCreate(['comment_id' => $comment->id, 'name' => $z_attachment->file_name]);
                            $path = storage_path('attachments/' . $attachment->file_name);
                            if (!file_exists($path)) {
                                file_put_contents($path, file_get_contents($z_attachment->content_url));
                            }
                        }
                    }
                }
            }
        }

        if (($next_page * $per_page) < $data->count) {
            return '<a href="?page=' . $next_page . '&perpage=' . $per_page . '">Import page ' . $next_page . ' of ' . $total_pages . '</a> (' . $data->count . ' total tickets)';
        } else {
            return 'done';
        }

    }

    private function getUserId($z_user_id, $api) {
        $user = $this->getUser($z_user_id, $api);

        return $user ? $user->id : $z_user_id;
    }

    private function getUser($z_user_id, $api) {

        if (array_key_exists($z_user_id, $this->user_cache)) {
            return $this->user_cache[$z_user_id];
        }

        $z_user = $api->users()->find($z_user_id)->user;

        if (is_null($z_user->email)) {
            return null;
        }

        $user = User::whereEmail($z_user->email)->first();

        if (!$user) {
            $name = explode(' ', $z_user->name);
            $user = User::create([
                'first_name' => count($name) > 0 ? $name[0] : '',
                'last_name'  => count($name) > 1 ? $name[1] : '',
                'email'      => $z_user->email
            ]);
        }

        $this->user_cache[$z_user->id] = $user;

        return $user;
    }

}
