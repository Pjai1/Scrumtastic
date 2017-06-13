<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Task;
use Illuminate\Database\Eloquent\SoftDeletes;

class Notification extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'message',
        'task_id'
    ];

    protected $dates = ['deleted_at'];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }
}
