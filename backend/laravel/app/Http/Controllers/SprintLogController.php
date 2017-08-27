<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\SprintLog;
use App\Repositories\SprintLogRepository;
use App\Http\Controllers\ApiController;

class SprintLogController extends ApiController
{
    private $sprintlog;

    public function __construct(SprintLogRepository $sprintlog) 
    {
        $this->middleware('auth:api');
    	$this->sprintlog = $sprintlog;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $sprintlogs = $this->sprintlog->find();

        return $this->showAll($sprintlogs);
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
            'sprint_id' => 'required|exists:sprints,id',
            'date_of_sprint' => 'required|date',
            'total_storypoints' => 'required|integer|min:1',
            'remaining_storypoints' => 'required|min:0|greater_than_or_equal'
        ];  

        $this->validate($request, $rules);

        $data = $request->all();   

        $sprintlog = SprintLog::create($data);     

        return $this->showOne($sprintlog, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(SprintLog $sprintlog)
    {
        $sprintlog = $this->sprintlog->findBy($sprintlog);

        return $this->showOne($sprintlog);
    }

    public function showAllLogsById($id)
    {
        $sprintlog = $this->sprintlog->findAllById($id);

        return $this->showAll($sprintlog);
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
    public function update(Request $request, SprintLog $sprintlog)
    {
        $sprintlog = $this->sprintlog->findBy($sprintlog);

        $rules = [
            'sprint_id' => 'required|exists:sprints,id',
            'date_of_sprint' => 'required|date',
            'total_storypoints' => 'required|integer|min:1',
            'remaining_storypoints' => 'required|min:0|greater_than_or_equal'
        ];  

        $this->validate($request, $rules);

        $sprintlog->sprint_id = $request->sprint_id;
        $sprintlog->date_of_sprint = $request->date_of_sprint;
        $sprintlog->total_storypoints = $request->total_storypoints;
        $sprintlog->remaining_storypoints = $request->remaining_storypoints;

        $sprintlog->save();

        return $this->showOne($sprintlog);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(SprintLog $sprintlog)
    {
        $sprintlog = $this->sprintlog->findBy($sprintlog);

        $sprintlog->charts()->delete();
        $sprintlog->delete();

        return $this->showOne($sprintlog);
    }
}
