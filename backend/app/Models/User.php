<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable {

    protected $table = 'users';
    public $appends = ['name', 'initials', 'abbreviation', 'avatar_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];

    public function comments() {
        return $this->belongsToMany(Comment::class, 'comment_recipients');
    }

    public function getNameAttribute() {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getAbbreviationAttribute() {
        return trim($this->first_name . ' ' . substr($this->last_name, 0, 1) . '.');
    }

    public function getInitialsAttribute() {
        return strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1));
    }

    public function getAvatarUrlAttribute() {
        return "http://www.gravatar.com/avatar/" . md5(strtolower(trim($this->email))) . "?d=monsterid&s=200";
    }

}
