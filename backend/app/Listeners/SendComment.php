<?php

namespace App\Listeners;

use App\Events\CommentCreated;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class SendComment {
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
     * @param  CommentCreated $event
     * @return void
     */
    public function handle(CommentCreated $event) {
        // Send email when comment is created

        $comment = $event->comment;

        if ($comment->type === 'draft' || $comment->getSentAt()) {
            return;
        }

        $sender = $comment->sender;

        // Remove sender from recipients
        $recipients = $comment->recipients->reject(function($recipient) use ($sender) {
            return $recipient->id === $sender->id;
        });

        $subject = $comment->project ? $comment->project->full_name : $comment->event->name;

        foreach ($recipients as $recipient) {

            Mail::send(['emails.comment-html', 'emails.comment'], ['comment' => $comment, 'subject' => $subject], function ($m) use ($comment, $subject, $recipient) {

                $m->subject($subject);
                $m->to($recipient->email, $recipient->name);
                $m->from($comment->sender->email, $comment->sender->name);
                $m->replyTo('comment_' . $comment->id . '@mailgun.faithpromise.org', $comment->sender->name);

            });

        }

        $comment->sent_at = Carbon::now();
        $comment->save();

    }

}
