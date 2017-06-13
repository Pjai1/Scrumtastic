<?php

namespace App\Repositories;

use App\Team;

class TeamRepository
{
    protected $team;

    public function __construct(Team $team) 
    {
        $this->team = $team;
    }

    public function find()
    {
        return $this->team->get();
    }

    public function findBy(Team $team)
    {
        return $team;
    }

    public function findAllProjects(Team $team)
    {
        return $this->team->where('id', $team->id)->with('projects')->get();
    }

    public function findAllUsers(Team $team)
    {
        return $this->team->where('id', $team->id)->with('users')->get();
    }
}