<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class TaskUser extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'task_id'
    ];

    protected $dates = ['deleted_at'];

    protected $table = 'task_user';

    public $timestamps = false;
}
