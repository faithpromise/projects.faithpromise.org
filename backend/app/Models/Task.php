<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model {

    use TaskTrait;

    protected $dates = ['start_at', 'due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name', 'estimated_start_date', 'estimated_completion_date'];
    public $guarded = ['id'];

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

    public function getIsStartAttribute() {
        return array_key_exists('is_start', $this->attributes) ? $this->attributes['is_start'] : true;
    }

    public function getDueAtAttribute($value) {
        return $value ? $value : ($this->project ? $this->project->due_at->toDateString() : null);
    }

    public function getEstimatedStartDateAttribute() {
        return $this->timeline_tasks()->min('timeline_date');
    }

    public function getEstimatedCompletionDateAttribute() {
        return $this->timeline_tasks()->max('timeline_date');
    }

}
