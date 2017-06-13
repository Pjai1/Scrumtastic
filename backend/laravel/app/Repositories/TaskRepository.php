<?php

namespace App\Repositories;

use App\Task;

class TaskRepository
{
    protected $task;

    public function __construct(Task $task) 
    {
        $this->task = $task;
    }

    public function find()
    {
        return $this->task->get();
    }

    public function findBy(Task $task)
    {
        return $task;
    }

    public function findAllComments(Task $task)
    {
        return $this->task->where('id', $task->id)->with('comments')->get();
    }

    public function findAllBugs(Task $task)
    {
        return $this->task->where('id', $task->id)->with('bugs')->get();
    }

    public function findAllNotifications(Task $task)
    {
        return $this->task->where('id', $task->id)->with('notifications')->get();
    }

    public function findAllUsers(Task $task)
    {
        return $this->task->where('id', $task->id)->with('users')->get();
    }
}