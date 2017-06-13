<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Task;
use Illuminate\Database\Eloquent\SoftDeletes;

class Bug extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'description',
        'task_id'
    ];

    protected $dates = ['deleted_at'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
