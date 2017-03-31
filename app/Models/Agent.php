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
        return $this->hasMany(Appointment::class, 'user_id');
    }

    public function getCapacity(Carbon $day) {
        $column = $this->dow_columns[$day->dayOfWeek];
        $capacity_in_minutes = $this->$column * 60;

        // Get total number of minutes in appointments for this day
        $appointment_minutes = 0;
        $appointments = $this->appointments()->whereDate('starts_at', '=', $day)->get();

        foreach ($appointments as $appointment) {
            $appointment_minutes += $appointment->starts_at->diffInMinutes($appointment->ends_at);
        }

        $capacity = max(0, ($capacity_in_minutes - $appointment_minutes));

        return $capacity;
    }

    public function getWorkloadAttribute() {
        $minutes = (int)$this->tasks()->sum('duration');
        return round($minutes / 60, 1);
    }

    public function getAvailableAtAttribute() {
        $max_day = new Carbon($this->timeline_days()->max('day'));

        return $max_day->addDay()->toDateString();
    }

}
