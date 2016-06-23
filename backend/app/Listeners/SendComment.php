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

        if ($comment->type === 'draft' OR $comment->recipients->count() === 0) {
            return;
        }

        Mail::send(['text' => 'emails.comment'], ['comment' => $comment], function ($m) use ($comment) {

            $m->subject($comment->project ? $comment->project->full_name : $comment->event->name);
            $m->from($comment->sender->email, $comment->sender->name);
            $m->replyTo('comment_' . $comment->id . '@mailgun.faithpromise.org', $comment->sender->name);

            foreach ($comment->recipients as $recipient) {
                if ($recipient->id !== $comment->sender->id) {
                    $m->to('dev@faithpromise.org', $recipient->name); // TODO: Set back to recipient's email
                }
            }

            foreach ($comment->attachments as $attachment) {
                $mime_type = File::mimeType($attachment->path);
                $m->attach($attachment->path, ['as' => $attachment->name, 'mime' => $mime_type]);
            }

        });

        $comment->sent_at = Carbon::now();
        $comment->save();

    }
}
