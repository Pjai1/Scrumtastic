<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Comment;
use App\Task;
use App\Team;
use App\Project;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Transformers\UserTransformer;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use Notifiable, HasApiTokens, SoftDeletes;

    const ADMIN_USER = 'true';
    const REGULAR_USER = 'false';

    const VERIFIED_USER = '1';
    const UNVERIFIED_USER = '0';

    public $transformer = UserTransformer::class;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 
        'email', 
        'password',
        'verified',
        'verification_token',
        'admin'
    ];

    protected $dates = ['deleted_at'];

    protected $table = 'users';

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 
        'remember_token',
        'verification_token'
    ];

    public function routeNotificationForSlack()
    {
        return 'https://hooks.slack.com/services/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';
    }

    public function setNameAttribute($name)
    {
        return $this->attributes['name'] = strtolower($name);
    }

    public function getNameAttribute($name)
    {
        return ucwords($name);
    }

    public function setEmailAttribute($email)
    {
        return $this->attributes['email'] = strtolower($email);
    }

    public function isVerified() 
    {
        return $this->verified == User::VERIFIED_USER;
    }

    public function isAdmin()
    {
        return $this->admin == User::ADMIN_USER;
    }

    public static function generateVerificationCode()
    {
        return str_random(40);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function tasks()
    {
        return $this->belongsToMany(Task::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class);
    }

    public function projects()
    {
        return $this->belongsToMany(Project::class);
    }
}
