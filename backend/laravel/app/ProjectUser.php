<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\User;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectUser extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'admin',
        'story_points',
        'project_id',
        'user_id'
    ];

    protected $dates = ['deleted_at'];

    protected $table = 'project_user';

    public $timestamps = false;

    public function isAdmin()
    {
        return $this->admin == User::ADMIN_USER;
    }
}
