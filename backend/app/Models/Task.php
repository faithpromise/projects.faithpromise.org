<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Task extends Model {

    use TaskTrait;

    protected $dates = ['start_at', 'due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name'];

    public function getIsStartAttribute() {
        return array_key_exists('is_start', $this->attributes) ? $this->attributes['is_start'] : true;
    }

    public function getDueAtAttribute($value) {
        return $value ? $value : ($this->project ? $this->project->due_at : null);
    }

}
