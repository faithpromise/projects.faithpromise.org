<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;

class Message extends Comment {

    protected static function boot() {
        parent::boot();

        static::addGlobalScope('message', function (Builder $builder) {
            $builder->whereNull('parent_id');
        });
    }

    public function replies() {
        return $this->hasMany(Reply::class, 'parent_id')->orderBy('created_at', 'desc');
    }

}
