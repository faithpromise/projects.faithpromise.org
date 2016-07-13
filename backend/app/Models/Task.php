<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model {

    use TaskTrait;
    use SoftDeletes;

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

    public function getCalculatedDueAtAttribute() {
        return $this->due_at ? $this->due_at : ($this->project ? (new Carbon($this->project->due_at)) : null);
    }

    public function getEstimatedStartDateAttribute() {
        return $this->timeline_tasks()->min('timeline_date');
    }

    public function getEstimatedCompletionDateAttribute() {
        return $this->timeline_tasks()->max('timeline_date');
    }

    public function setEventId($param) {
        $this->{'event_id'} = $param;

        return $this;
    }

    public function setProjectId($param) {
        $this->{'project_id'} = $param;

        return $this;
    }

    public function setAgentId($param) {
        $this->{'agent_id'} = $param;

        return $this;
    }

    public function setName($param) {
        $this->{'name'} = $param;

        return $this;
    }

    public function setDuration($param) {
        $this->{'duration'} = $param;

        return $this;
    }

    public function setSort($param) {
        $this->{'sort'} = $param;

        return $this;
    }

    public function setDueAt($param) {
        $this->{'due_at'} = $param;

        return $this;
    }

    public function fillMore($data) {

        $this->fill($data);

        if (isset($data['event']['id'])) {
            $this->setEventId($data['event']['id']);
        }

        if (isset($data['project']['id'])) {
            $this->setProjectId($data['project']['id']);
        }

        if (isset($data['agent']['id'])) {
            $this->setAgentId($data['agent']['id']);
        }

        return $this;

    }

}
