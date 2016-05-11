<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model {

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

}
