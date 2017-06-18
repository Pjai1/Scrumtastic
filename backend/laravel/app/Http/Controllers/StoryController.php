<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Story;
use App\Repositories\StoryRepository;
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\DB;

class StoryController extends ApiController
{
    private $story;

    public function __construct(StoryRepository $story) 
    {
        $this->middleware('auth:api');
    	$this->story = $story;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $stories = $this->story->find();

        return $this->showAll($stories);
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
            'feature_id' => 'required|exists:features,id',
            'description' => 'required'
        ];

        $this->validate($request, $rules);      

        $data = $request->all();

        $story = Story::create($data);  

        return $this->showOne($story, 201);
    }

    public function storeWithSprint(Request $request)
    {
        $rules = [
            'sprint_id' => 'required|exists:sprints,id',
            'project_id' => 'required|exists:projects,id',
            'description' => 'required'
        ];

        $this->validate($request, $rules);   

        $story = new Story;
        $story->project_id = $request->project_id;
        $story->description = $request->description;
        $story->save();

        $story->sprints()->attach($request->sprint_id);

        return $this->showOne($story, 201);
    }

    public function storePivotSprint(Request $request)
    {
        $rules = [
            'sprint_id' => 'required|exists:sprints,id',
            'story_id' => 'required|exists:stories,id'
        ];

        $this->validate($request, $rules);   

        $story = Story::find($request->story_id);
        $story->sprints()->attach($request->sprint_id);

        return $this->showOne($story, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Story $story)
    {
        $story = $this->story->findBy($story);

        return $this->showOne($story);
    }

    public function showStoryTasks(Story $story)
    {
        $tasks = $this->story->findAllTasks($story);

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
    public function update(Request $request, Story $story)
    {
        $story = $this->story->findBy($story);

        $rules = [
            'feature_id' => 'required|exists:features,id',
            'description' => 'required'
        ];

        $this->validate($request, $rules);

        $story->project_id = $request->project_id;
        $story->feature_id = $request->feature_id;
        $story->description = $request->description;

        $story->save();

        return $this->showOne($story);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Story $story)
    {
        $story = $this->story->findBy($story);

        $story->sprints()->detach();
        $story->delete();

        return $this->showOne($story);
    }
}
