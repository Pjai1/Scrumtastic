<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\SprintLog;
use App\Task;
use App\Project;
use App\Story;
use App\Feature;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sprint extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'total_storypoints',
        'remaining_storypoints',
        'start_date',
        'end_date',
        'project_id',
        'feature_id'
    ];

    protected $dates = ['deleted_at'];

    public function sprintlogs()
    {
        return $this->hasMany(SprintLog::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function stories()
    {
        return $this->belongsToMany(Story::class);
    }

    public function feature()
    {
        return $this->belongsTo(Feature::class);
    }
}
