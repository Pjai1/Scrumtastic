<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Story;
use App\Project;
use Illuminate\Database\Eloquent\SoftDeletes;

class Feature extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'project_id'
    ];

    protected $dates = ['deleted_at'];

    public function stories()
    {
        return $this->hasMany(Story::class);
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
