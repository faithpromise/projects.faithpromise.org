<?php

namespace App\Models;

class TimelineTask2 extends Task {

    protected $dates = ['start_at', 'due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name', 'is_end', 'is_start', 'timeline_duration'];

    public function getIsStartAttribute() {
        return array_key_exists('is_start', $this->attributes) ? $this->attributes['is_start'] : true;
    }

    public function setIsStartAttribute($value) {
        $this->attributes['is_start'] = $value;
    }

    public function getIsEndAttribute() {
        return array_key_exists('is_end', $this->attributes) ? $this->attributes['is_end'] : true;
    }

    public function setIsEndAttribute($value) {
        $this->attributes['is_end'] = $value;
    }

    public function setTimelineDurationAttribute($value) {
        $this->attributes['timeline_duration'] = $value;
    }

    public function getTimelineDurationAttribute() {
        return array_key_exists('timeline_duration', $this->attributes) ? $this->attributes['timeline_duration'] : $this->duration_in_minutes;
    }

}
