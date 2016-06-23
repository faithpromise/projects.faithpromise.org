<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model {

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
        $this->{'sent_at'} = $param;
        return $this;
    }

    public function getSentAt() {
        return $this->{'sent_at'};
    }

}
