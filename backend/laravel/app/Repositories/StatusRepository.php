<?php

namespace App\Repositories;

use App\Status;

class StatusRepository
{
    protected $status;

    public function __construct(Status $status) 
    {
        $this->status = $status;
    }

    public function find()
    {
        return $this->status->get();
    }

    public function findBy(Status $status)
    {
        return $status;
    }
}