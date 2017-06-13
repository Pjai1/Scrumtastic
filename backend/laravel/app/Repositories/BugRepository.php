<?php

namespace App\Repositories;

use App\Bug;

class BugRepository
{
    protected $bug;

    public function __construct(Bug $bug) 
    {
        $this->bug = $bug;
    }

    public function find()
    {
        return $this->bug->get();
    }

    public function findBy(Bug $bug)
    {
        return $bug;
    }
}