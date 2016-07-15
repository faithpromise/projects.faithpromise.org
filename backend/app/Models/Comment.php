<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model {

    use SoftDeletes;

    protected $table = 'comments';
    public $fillable = ['event_id', 'project_id', 'user_id', 'type', 'body'];

    public function event() {
        return $this->belongsTo(Event::class);
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function task() {
        return $this->belongsTo(Task::class);
    }

    public function sender() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recipients() {
        return $this->belongsToMany(User::class, 'comment_recipients', 'comment_id', 'user_id');
    }

    public function attachments() {
        return $this->hasMany(Attachment::class);
    }

    /**
     * Getters and setters
     */

    public function setUserId($param) {
        $this->{'user_id'} = $param;
        return $this;
    }

    public function getUserId() {
        return $this->{'user_id'};
    }

    public function setEventId($param) {
        $this->{'event_id'} = $param;
        return $this;
    }

    public function getEventId() {
        return $this->{'event_id'};
    }

    public function setProjectId($param) {
        $this->{'project_id'} = $param;
        return $this;
    }

    public function getProjectId() {
        return $this->{'project_id'};
    }

    public function setType($param) {
        $this->{'type'} = $param;
        return $this;
    }

    public function getType() {
        return $this->{'type'};
    }

    public function setBody($param) {
        $this->{'body'} = $param;
        return $this;
    }

    public function getBody() {
        return $this->{'body'};
    }

    public function setSentAt($param) {
        $this->sent_at = $param ? (new Carbon($param)) : null;
        return $this;
    }

    public function getSentAt() {
        return $this->{'sent_at'};
    }

    public function syncRecipients($recipient_ids) {

        $sender_id = $this->getUserId();

        if ($recipient_ids instanceof Collection) {
            $recipient_ids = $recipient_ids->modelKeys();
        }

        // Always remove sender
        $recipient_ids = array_filter($recipient_ids, function($id) use ($sender_id) {
            return $id !== $sender_id;
        });

        $this->recipients()->sync($recipient_ids);

    }

}
