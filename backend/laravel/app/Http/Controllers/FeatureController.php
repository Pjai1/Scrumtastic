<?php

namespace App\Http\Controllers;

use App\Feature;
use Illuminate\Http\Request;
use App\Repositories\FeatureRepository;
use App\Http\Controllers\ApiController;

class FeatureController extends ApiController
{
    private $feature;

    public function __construct(FeatureRepository $feature) 
    {
        $this->middleware('auth:api');
    	$this->feature = $feature;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $features = $this->feature->find();

        return $this->showAll($features);
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
            'project_id' => 'required|exists:projects,id',
            'name' => 'required'
        ];

        $this->validate($request, $rules);

        $data = $request->all();

        $feature = Feature::create($data);        

        return $this->showOne($feature, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Feature  $feature
     * @return \Illuminate\Http\Response
     */
    public function show(Feature $feature)
    {
        $feature = $this->feature->findBy($feature);

        return $this->showOne($feature);
    }

    public function showFeatureStories(Feature $feature)
    {
        $stories = $this->feature->findAllStories($feature);

        return $this->showAll($stories);
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Feature  $feature
     * @return \Illuminate\Http\Response
     */
    public function edit(Feature $feature)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Feature  $feature
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Feature $feature)
    {
        $feature = $this->feature->findBy($feature);

        $rules = [
            'project_id' => 'required|exists:projects,id',
            'name' => 'required'
        ];

        $this->validate($request, $rules);

        $feature->project_id = $request->project_id;
        $feature->name = $request->name;

        $feature->save();

        return $this->showOne($feature);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Feature  $feature
     * @return \Illuminate\Http\Response
     */
    public function destroy(Feature $feature)
    {
        $feature = $this->feature->findBy($feature);

        $feature->stories()->delete();
        $feature->delete();

        return $this->showOne($feature);
    }
}
