<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Agent extends User {

    protected static function boot() {
        parent::boot();

        static::addGlobalScope('agent', function(Builder $builder) {
            $builder->where('is_agent', '=', true);
        });
    }

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function tasks() {
        return $this->hasMany(Task::class);
    }

    public function appointments() {
        return $this->hasMany(Appointment::class);
    }

}
