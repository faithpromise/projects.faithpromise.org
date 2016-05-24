<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Class Project
 * @package App\Models
 * 
 * @property string full_name;
 *
 */
class Project extends Model {

    protected $dates = ['due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name'];

    public function event() {
        return $this->belongsTo(Event::class);
    }

    public function requester() {
        return $this->belongsTo(Requester::class, 'requester_id');
    }

    public function agent() {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function tasks() {
        return $this->hasMany(Task::class);
    }

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function files() {
        return $this->hasManyThrough(File::class, Comment::class);
    }

    public function getFullNameAttribute() {
        $event = $this->event;

        if (!$event) {
            return $this->getOriginal('name');
        }

        return $this->getOriginal('name') . ' for ' . $this->event->name;
    }

}
