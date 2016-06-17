<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model {

    protected $table = 'comments';
    public $fillable = ['parent_id', 'event_id', 'project_id', 'user_id', 'subject', 'body'];

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

    public function parent() {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function recipients() {
        return $this->belongsToMany(User::class, 'comment_recipients', 'comment_id', 'user_id');
    }

    public function getSubjectAttribute($value) {
        if ($this->parent_id) {
            return $this->parent->subject;
        }

        return $value;
    }
}
