<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineTask extends Model {

    use TaskTrait;

    protected $guarded = ['id'];
    protected $appends = ['full_name'];
    protected $dates = ['timeline_date', 'start_at', 'due_at', 'completed_at', 'created_at', 'updated_at'];

    public function timeline_day() {
        return $this->belongsTo(TimelineDay::class);
    }

}
