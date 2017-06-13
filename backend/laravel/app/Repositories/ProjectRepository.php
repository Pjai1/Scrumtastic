<?php

namespace App\Repositories;

use App\Project;

class ProjectRepository
{
    protected $project;

    public function __construct(Project $project) 
    {
        $this->project = $project;
    }

    public function find()
    {
        return $this->project->get();
    }

    public function findBy(Project $project)
    {
        return $project;
    }

    public function findAllUsers(Project $project)
    {
        return $this->project->where('id', $project->id)->with('users')->get();
    }

    public function findAllSprints(Project $project)
    {
        return $this->project->where('id', $project->id)->with('sprints')->get();
    }

    public function findAllTeams(Project $project)
    {
        return $this->project->where('id', $project->id)->with('teams')->get();
    }

    public function findAllFeatures(Project $project)
    {
        return $this->project->where('id', $project->id)->with('features')->get();
    }

    public function findAllStories(Project $project)
    {
        return $this->project->where('id', $project->id)->with('stories')->get();
    }
}