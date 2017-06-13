<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Sprint;
use App\Repositories\SprintRepository;
use App\Http\Controllers\ApiController;

class SprintController extends ApiController
{
    private $sprint;

    public function __construct(SprintRepository $sprint) 
    {
        $this->middleware('auth:api');
    	$this->sprint = $sprint;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $sprints = $this->sprint->find();

        return $this->showAll($sprints);
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
        $sprintCounter = Sprint::count();
        $rules = [
            'project_id' => 'required|exists:projects,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ];

        $this->validate($request, $rules);

        $data = $request->all();
        $data['name'] = 'Sprint '.($sprintCounter+1);

        $sprint = Sprint::create($data);        

        return $this->showOne($sprint, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Sprint $sprint)
    {
        $sprint = $this->sprint->findBy($sprint);

        return $this->showOne($sprint);
    }

    public function showSprintLogs(Sprint $sprint)
    {
        $sprintlogs = $this->sprint->findAllSprintLogs($sprint);

        return $this->showAll($sprintlogs);
    }

    public function showSprintStories(Sprint $sprint)
    {
        $stories = $this->sprint->findAllStories($sprint);

        return $this->showAll($stories);
    }

    public function showSprintTasks(Sprint $sprint)
    {
        $tasks = $this->sprint->findAllTasks($sprint);

        return $this->showAll($tasks);
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
    public function update(Request $request, Sprint $sprint)
    {
        $sprint = $this->sprint->findBy($sprint);

        $rules = [
            'project_id' => 'required|exists:projects,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date'
        ];

        $this->validate($request, $rules);

        $data = $request->all();
        $sprint->project_id = $request->project_id;
        $sprint->start_date = $request->start_date;
        $sprint->end_date = $request->end_date;

        $sprint->save();

        return $this->showOne($sprint);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Sprint $sprint)
    {
        $sprint = $this->sprint->findBy($sprint);

        $sprint->sprintlogs()->delete();
        $sprint->tasks()->delete();
        $sprint->stories()->detach();
        $sprint->delete();

        return $this->showOne($sprint);
    }
}
