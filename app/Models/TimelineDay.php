<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineDay extends Model {

    protected $guarded = ['id'];
    protected $dates = ['day', 'created_at', 'updated_at'];

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

}
