<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable {

    use SoftDeletes;

    protected $table = 'users';
    public $appends = ['name', 'initials', 'abbreviation', 'avatar_url'];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'first_name', 'last_name', 'email', 'password',
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

    /**
     * Getters and setters
     */

    public function getId() {
        return $this->{'id'};
    }

    public function setFirstName($param) {
        $this->{'first_name'} = $param;
        return $this;
    }

    public function getFirstName() {
        return $this->{'first_name'};
    }

    public function setLastName($param) {
        $this->{'last_name'} = $param;
        return $this;
    }

    public function getLastName() {
        return $this->{'last_name'};
    }

    public function setEmail($param) {
        $this->{'email'} = $param;
        return $this;
    }

    public function getEmail() {
        return $this->{'email'};
    }

}
