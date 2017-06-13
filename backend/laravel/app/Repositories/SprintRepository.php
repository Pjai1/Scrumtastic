<?php

namespace App\Repositories;

use App\Sprint;

class SprintRepository
{
    protected $sprint;

    public function __construct(Sprint $sprint) 
    {
        $this->sprint = $sprint;
    }

    public function find()
    {
        return $this->sprint->get();
    }

    public function findBy(Sprint $sprint)
    {
        return $sprint;
    }

    public function findAllTasks(Sprint $sprint)
    {
        return $this->sprint->where('id', $sprint->id)->with('tasks')->get();
    }

    public function findAllSprintLogs(Sprint $sprint)
    {
        return $this->sprint->where('id', $sprint->id)->with('sprintlogs')->get();
    }

    public function findAllStories(Sprint $sprint)
    {
        return $this->sprint->where('id', $sprint->id)->with('stories')->get();
    }
}