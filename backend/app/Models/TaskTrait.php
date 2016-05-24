<?php

namespace App\Models;

/**
 * Class TaskTrait
 *
 * @property Project project;
 * @property Event event;
 * @property int event_id;
 */

trait TaskTrait {

    public function event() {
        return $this->belongsTo(Event::class);
    }

    public function project() {
        return $this->belongsTo(Project::class);
    }

    public function agent() {
        return $this->belongsTo(Agent::class, 'agent_id', 'id');
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function getFullNameAttribute() {

        if ($this->event_id) {
            return $this->getOriginal('name') . ' [' . $this->event->name . ']';
        }

        return $this->getOriginal('name') . ' [' . $this->project->full_name . ']';
    }

}