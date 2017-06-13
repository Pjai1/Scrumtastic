<?php

namespace App\Repositories;

use App\User;

class UserRepository
{
    protected $user;

    public function __construct(User $user) 
    {
        $this->user = $user;
    }

    public function find()
    {
        return $this->user->get();
    }

    public function findBy(User $user)
    {
        return $user;
    }

    public function findAllAdmins()
    {
        return $this->user->where('admin', 'true')->get();
    }

    public function findAllComments(User $user)
    {
        return $this->user->where('id', $user->id)->with('comments')->get();
    }

    public function findAllTeams(User $user)
    {
        return $this->user->where('id', $user->id)->with('teams')->get();
    }

    public function findAllTasks(User $user)
    {
        return $this->user->where('id', $user->id)->with('tasks')->get();
    }

    public function findAllProjects(User $user)
    {
        return $this->user->where('id', $user->id)->with('projects')->get();
    }

    public function getToken($token)
    {
        return $this->user->where('verification_token', $token)->firstOrFail();
    }
}