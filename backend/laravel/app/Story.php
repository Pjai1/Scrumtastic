<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Project;
use App\Sprint;
use App\Task;
use Illuminate\Database\Eloquent\SoftDeletes;

class Story extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'description',
        'project_id',
        'feature_id'
    ];

    protected $dates = ['deleted_at'];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function sprints()
    {
        return $this->belongsToMany(Sprint::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
