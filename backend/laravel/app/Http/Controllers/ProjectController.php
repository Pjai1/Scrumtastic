<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Project;
use App\ProjectUser;
use App\Repositories\ProjectRepository;
use App\Http\Controllers\ApiController;

class ProjectController extends ApiController
{
    private $project;

    public function __construct(ProjectRepository $project) 
    {
        $this->middleware('auth:api');
        $this->middleware('user.admin', ['only' => ['index']]);
        $this->middleware('project.resources', ['except' => ['index', 'store']]);
    	$this->project = $project;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $projects = $this->project->find();

        return $this->showAll($projects);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $rules = [
            'name' => 'required',
            'description' => 'max:1000'
        ];

        $this->validate($request, $rules);

        $data = $request->all();
        $userId = $request->user_id;

        $project = Project::create($data);

        $projectUser = new ProjectUser;
        $projectUser->project_id = $project->id;
        $projectUser->user_id = $userId;
        $projectUser->save();

        return $this->showOne($project, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Project $project)
    {
        $project = $this->project->findBy($project);

        return $this->showOne($project);
    }

    public function showProjectTeams(Project $project)
    {
        $teams = $this->project->findAllTeams($project);

        return $this->showAll($teams);
    }

    public function showProjectUsers(Project $project)
    {
        $users = $this->project->findAllUsers($project);

        return $this->showAll($users);
    }

    public function showProjectStories(Project $project)
    {
        $stories = $this->project->findAllStories($project);

        return $this->showAll($stories);
    }

    public function showProjectFeatures(Project $project)
    {
        $features = $this->project->findAllFeatures($project);

        return $this->showAll($features);
    }

    public function showProjectSprints(Project $project)
    {
        $sprints = $this->project->findAllSprints($project);

        return $this->showAll($sprints);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Project $project)
    {
        $project = $this->project->findBy($project);

        $rules = [
            'name' => 'required',
            'description' => 'max:1000'
        ];

        $this->validate($request, $rules);

        $project->name = $request->name;
        $project->description = $request->description;

        $project->save();

        return $this->showOne($project);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Project $project)
    {
        $project = $this->project->findBy($project);

        $project->stories()->delete();
        $project->sprints()->delete();
        $project->features()->delete();
        $project->users()->detach();
        $project->teams()->detach();
        $project->delete();

        return $this->showOne($project);
    }
}
