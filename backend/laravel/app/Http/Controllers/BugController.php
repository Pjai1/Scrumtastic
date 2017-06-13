<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Bug;
use App\Repositories\BugRepository;
use App\Http\Controllers\ApiController;

class BugController extends ApiController
{
    private $bug;

    public function __construct(BugRepository $bug) 
    {
        $this->middleware('auth:api');
    	$this->bug = $bug;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $bugs = $this->bug->find();

        return $this->showAll($bugs);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        
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
            'task_id' => 'required|exists:tasks,id',
            'description' => 'required|max:1000'
        ];

        $this->validate($request, $rules);

        $data = $request->all();

        $bug = Bug::create($data);

        return $this->showOne($bug, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Bug $bug)
    {
        $bug = $this->bug->findBy($bug);

        return $this->showOne($bug);
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
    public function update(Request $request, Bug $bug)
    {
        $bug = $this->bug->findBy($bug);

        $rules = [
            'task_id' => 'required|exists:tasks,id',
            'description' => 'required|max:1000'
        ];   

        $this->validate($request, $rules);

        $bug->task_id = $request->task_id;
        $bug->description = $request->description;

        $bug->save();

        return $this->showOne($bug); 
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Bug $bug)
    {
        $bug = $this->bug->findBy($bug);

        $bug->delete();

        return $this->showOne($bug);
    }
}
