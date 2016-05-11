<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model {

    protected $dates = ['due_at', 'created_at', 'updated_at'];

    public function event() {
        return $this->belongsTo(Event::class);
    }

    public function requester() {
        return $this->belongsTo(Requester::class, 'user_id', 'requester_id');
    }

    public function agent() {
        return $this->belongsTo(Agent::class, 'user_id', 'agent_id');
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function files() {
        return $this->hasManyThrough(File::class, Comment::class);
    }

}
