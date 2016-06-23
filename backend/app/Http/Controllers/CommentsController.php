<?php

namespace App\Http\Controllers;

use App\Events\CommentCreated;
use App\Models\Comment;
use App\Models\Project;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;

use App\Http\Requests;

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

        if (array_key_exists('recipients', $data) && !empty($data['recipients'])) {
            $comment->recipients()->attach($data['recipients']);
        }

        Event::fire(new CommentCreated($comment));

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
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {

        $data = $request->input('data');
        $comment = Comment::find($id);
        $comment->update($data);

        if (array_key_exists('recipients', $data) && !empty($data['recipients'])) {
            $comment->recipients()->sync($data['recipients']);
        }

        Event::fire(new CommentCreated($comment));

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

        $email = $request->all();

        $parent_comment_id = (int)str_replace(['comment_', '@mailgun.faithpromise.org'], '', $email['recipient']);
        $sender_email = strtolower($email['sender']);
        $sender_name = trim(str_ireplace('<' . $sender_email . '>', '', $email['from']), ' ');
        $body = $email['stripped-text'];
        $date_sent = Carbon::parse($email['Date']);

        /** @var Comment $parent_comment */
        $parent_comment = Comment::find($parent_comment_id);

        $user = User::where('email', '=', $sender_email)->first();

        if (!$user) {
            $user = new User();
            $user->setFirstName($sender_name[0]);
            $user->setLastName(count($sender_name) > 1 ? implode(' ', array_slice($sender_name, 1)) : null);
            $user->setEmail($sender_email);
            $user->save();
        }

        $comment = new Comment();
        $comment->setType('comment');
        $comment->setEventId($parent_comment->getEventId());
        $comment->setProjectId($parent_comment->getProjectId());
        $comment->setUserId($user->getId());
        $comment->setBody($body);
        $comment->setSentAt($date_sent);
        $comment->save();

        $comment->recipients()->attach($parent_comment->recipients);

        Event::fire(new CommentCreated($comment));

    }
}
