<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Bug;
use App\Comment;
use App\Notification;
use App\Status;
use App\Story;
use App\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'remaining_storypoints',
        'total_storypoints',
        'story_id',
        'status_id'
    ];

    protected $dates = ['deleted_at'];

    protected $table = 'tasks';

    public function bugs()
    {
        return $this->hasMany(Bug::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function status()
    {
        return $this->belongsTo(Status::class);
    }

    public function story()
    {
        return $this->belongsTo(Story::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
