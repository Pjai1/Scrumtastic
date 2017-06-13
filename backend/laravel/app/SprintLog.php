<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Sprint;
use App\Chart;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sprintlog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sprint_id',
        'total_storypoints',
        'remaining_storypoints',
        'date_of_sprint'
    ];

    protected $dates = ['deleted_at'];

    public function sprint()
    {
        return $this->belongsTo(Sprint::class);
    }

    public function charts()
    {
        return $this->hasMany(Chart::class);
    }
}
