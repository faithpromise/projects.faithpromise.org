<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Event
 * @package App\Models
 *
 * @property string name;
 * 
 */

class Event extends Model {

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function tasks() {
        return $this->hasMany(Task::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

}
