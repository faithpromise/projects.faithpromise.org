<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable {

    protected $table = 'users';
    public $appends = ['name', 'short_name', 'abbreviation'];

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

    public function getNameAttribute() {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getShortNameAttribute() {
        return trim($this->first_name . ' ' . substr($this->last_name, 0, 1));
    }

    public function getAbbreviationAttribute() {
        return strtoupper(substr($this->first_name, 0, 1) . substr($this->last_name, 0, 1));
    }

    public function getAvatarUrlAttribute() {
        return "http://www.gravatar.com/avatar/" . md5(strtolower(trim($this->email))) . "?d=monsterid&s=200";
    }

}
