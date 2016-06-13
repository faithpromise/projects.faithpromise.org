<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

class Task extends Model {

    use TaskTrait;

    protected $dates = ['start_at', 'due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name', 'estimated_start_date', 'estimated_completion_date', 'calculated_due_at'];
    public $casts = [
        'due_at' => 'date'
    ];
    public $fillable = ['event_id', 'project_id', 'agent_id', 'name', 'notes', 'duration', 'start_at', 'due_at', 'completed_at', 'sort'];

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

    public function getIsStartAttribute() {
        return array_key_exists('is_start', $this->attributes) ? $this->attributes['is_start'] : true;
    }

    public function getCalculatedDueAtAttribute($value) {
        return $value ? (new Carbon($value)) : ($this->project ? (new Carbon($this->project->due_at)) : null);
    }

    public function getEstimatedStartDateAttribute() {
        return $this->timeline_tasks()->min('timeline_date');
    }

    public function getEstimatedCompletionDateAttribute() {
        return $this->timeline_tasks()->max('timeline_date');
    }

}
