<?php

namespace App\Models;

class Requester extends User {

    // TODO: Global scope to limit to !is_agent

    public function projects() {
        return $this->hasMany(Project::class);
    }

}
