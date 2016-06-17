<?php

namespace App\Models;

class Reply extends Comment {

    protected $table = 'comments';

    public function message() {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

}
