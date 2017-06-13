<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Project;
use App\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class Team extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name'
    ];

    protected $table = 'teams';

    public function projects()
    {
        return $this->belongsToMany(Project::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
