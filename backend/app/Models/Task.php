<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model {

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function agent() {
        return $this->belongsTo(Agent::class, 'user_id', 'agent_id');
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

}
