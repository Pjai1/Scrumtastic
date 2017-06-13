<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Story;
use App\Sprint;
use App\User;
use App\Team;
use App\Feature;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Transformers\ProjectTransformer;

class Project extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description'
    ];

    public $transformer = ProjectTransformer::class;

    protected $table = 'projects';

    protected $dates = ['deleted_at'];

    public function stories()
    {
        return $this->hasMany(Story::class);
    }

    public function sprints()
    {
        return $this->hasMany(Sprint::class);
    }

    public function features()
    {
        return $this->hasMany(Feature::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class);
    }
}
