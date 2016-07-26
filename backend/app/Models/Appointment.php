<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Appointment extends Model {

    public $dates = ['starts_at', 'ends_at', 'created_at', 'ends_at'];

    public function agent() {
        return $this->belongsTo(Agent::class, 'user_id');
    }

}
