<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\SprintLog;
use Illuminate\Database\Eloquent\SoftDeletes;

class Chart extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'sprintlog_id'
    ];

    protected $dates = ['deleted_at'];

    public function sprint()
    {
        return $this->belongsTo(SprintLog::class);
    }
}
