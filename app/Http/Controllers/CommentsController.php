<?php

namespace App\Http\Controllers;

use App\Events\CommentCreated;
use App\Models\Attachment;
use App\Models\Comment;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Http\Adapter\Guzzle6\Client as GuzzleClient;
use GuzzleHttp\Psr7\Request as GuzzleRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;

use App\Http\Requests;
use Illuminate\Support\Facades\Log;
use Mailgun\Mailgun;

class CommentsController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {

        $event_id = $request->input('event_id');
        $project_id = $request->input('project_id');

        $comments = Comment::with('sender')->with('recipients')->with('attachments')->where('type', '!=', 'draft')->orderBy('created_at', 'desc');

        if ($project_id) {
            $project = Project::find($project_id);
            $comments->where('project_id', '=', $project_id);
            if ($project->event_id) {
                $comments->orWhere('event_id', '=', $project->event_id);
            }
        } else if ($event_id) {
            $comments->where('event_id', '=', $event_id);
        } else {
            $comments->limit(20);
        }

        return [
            'data' => $comments->get()
        ];

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {

        $data = $request->input('data');
        $comment = Comment::create($data);

        $this->update_recipients($comment, $data);

        return [
            'data' => $comment
        ];
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {

    }

    /**
     * Update the specified resource in storage.
     * Needed because we save "drafts" on the frontend
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {

        $data = $request->input('data');
        $comment = Comment::find($id);
        $comment->update($data);

        $this->update_recipients($comment, $data);

    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {
        //
    }

    public function inbound(Request $request) {

        $email_data = $request->all();

        $parent_comment_id = (int)str_replace(['comment_', '@mailgun.faithpromise.org'], '', $email_data['recipient']);
        $sender_email = strtolower($email_data['sender']);
        $sender_name = trim(str_ireplace('<' . $sender_email . '>', '', $email_data['from']), ' ');
        $body = $email_data['stripped-text'];
        $date_sent = Carbon::parse($email_data['Date']);
        $files = array_key_exists('attachments', $email_data) ? json_decode($email_data['attachments']) : [];

        /** @var Comment $parent_comment */
        $parent_comment = Comment::find($parent_comment_id);

        $sender = User::where('email', '=', $sender_email)->first();

        if (!$sender) {
            $sender = new User();
            $sender->setFirstName($sender_name[0]);
            $sender->setLastName(count($sender_name) > 1 ? implode(' ', array_slice($sender_name, 1)) : null);
            $sender->setEmail($sender_email);
            $sender->save();
        }

        $comment = new Comment();
        $comment->setType('comment');
        $comment->setEventId($parent_comment->getEventId());
        $comment->setProjectId($parent_comment->getProjectId());
        $comment->setUserId($sender->getId());
        $comment->setBody($body);
        $comment->save();

        // Add attachments
        if (is_array($files) && count($files)) {

            $client = new GuzzleClient();
            $mailgun = new Mailgun(config('mail.mailgun_api_key'), $client);

            // Save attachments
            foreach ($files as $file) {

                $path_info = pathinfo($file->name);

                $attachment = new Attachment();
                $attachment->setCommentId($comment->id);
                $attachment->setName(str_slug($path_info['filename']) . '.' . $path_info['extension']);
                $attachment->save();

                // Can't simply use $mailgun->get($file->url) because it appends the API host domain to the endpoint using generateEndpoint()

                $client = new GuzzleClient();

                $headers['User-Agent'] = 'faithpromise/1.0';
                $headers['Authorization'] = 'Basic '.base64_encode(sprintf('%s:%s', 'api', config('mail.mailgun_api_key')));

                $request = new GuzzleRequest('GET', $file->url, $headers, null);
                $response = $client->sendRequest($request);
                $file_contents = (string) $response->getBody();

                $file_path = storage_path('attachments') . '/' . $attachment->file_name;
                file_put_contents($file_path, $file_contents);

            }
        }

        // Sync recipients last because "CommentCreated" event is fired within syncRecipients
        // Add original sender
        $recipients = $parent_comment->recipients->push($parent_comment->sender);
        $comment->syncRecipients($recipients);

    }

    private function update_recipients(Comment $comment, $data) {
        if (array_key_exists('recipients', $data)) {
            $recipients = array_pluck($data['recipients'], 'id');
            $comment->syncRecipients($recipients);
        }
    }

}
