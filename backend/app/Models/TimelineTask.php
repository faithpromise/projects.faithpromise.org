<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TimelineTask extends Model {

    use TaskTrait;

    protected $guarded = ['id'];
    protected $appends = ['full_name'];

    public function timeline_day() {
        return $this->belongsTo(TimelineDay::class);
    }

}
