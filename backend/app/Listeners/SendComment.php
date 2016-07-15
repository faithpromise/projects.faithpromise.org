<?php

namespace App\Listeners;

use App\Events\CommentCreated;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
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

        if ($comment->type === 'draft') {
            return;
        }

        $sender = $comment->sender;

        // Remove sender from recipients
        $recipients = $comment->recipients->reject(function($recipient) use ($sender) {
            return $recipient->id === $sender->id;
        });

        foreach ($recipients as $recipient) {

            Mail::send(['text' => 'emails.comment'], ['comment' => $comment], function ($m) use ($comment, $recipient) {

                $m->subject($comment->project ? $comment->project->full_name : $comment->event->name);
                $m->to($recipient->email, $recipient->name);
                $m->from($comment->sender->email, $comment->sender->name);
                $m->replyTo('comment_' . $comment->id . '@mailgun.faithpromise.org', $comment->sender->name);

                foreach ($comment->attachments as $attachment) {
                    $mime_type = File::mimeType($attachment->path);
                    $m->attach($attachment->path, ['as' => $attachment->name, 'mime' => $mime_type]);
                }

            });

        }

        $comment->sent_at = Carbon::now();
        $comment->save();

    }
}
