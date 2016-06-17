<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class Agent extends User {

    private $dow_columns = ['sunday_hours', 'monday_hours', 'tuesday_hours', 'wednesday_hours', 'thursday_hours', 'friday_hours', 'saturday_hours'];
    public $appends = ['name', 'initials', 'abbreviation', 'workload', 'available_at', 'avatar_url'];
    protected $dates = ['available_at', 'created_at', 'updated_at'];

    protected static function boot() {
        parent::boot();

        static::addGlobalScope('agent', function (Builder $builder) {
            $builder->where('is_agent', '=', true);
        });
    }

    public function projects() {
        return $this->hasMany(Project::class);
    }

    public function tasks() {
        return $this->hasMany(Task::class)->whereNull('completed_at');
    }

    public function timeline_days() {
        return $this->hasMany(TimelineDay::class);
    }

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

    public function appointments() {
        return $this->hasMany(Appointment::class);
    }

    public function getCapacity(Carbon $day) {
        $column = $this->dow_columns[$day->dayOfWeek];

        return $this->$column * 60;
    }

    public function getWorkloadAttribute() {
        return (int) $this->tasks()->sum('duration');
    }

    public function getAvailableAtAttribute() {
        $max_day = new Carbon($this->timeline_days()->max('day'));
        return $max_day->addDay()->toDateString();
    }

}
