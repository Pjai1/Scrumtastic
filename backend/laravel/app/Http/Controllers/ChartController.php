<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Chart;
use App\Repositories\ChartRepository;
use App\Http\Controllers\ApiController;

class ChartController extends ApiController
{
    private $chart;

    public function __construct(ChartRepository $chart) 
    {
        $this->middleware('auth:api');
    	$this->chart = $chart;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $charts = $this->chart->find();

        return $this->showAll($charts);
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
            'sprintlog_id' => 'required|exists:sprintlogs,id',
            'name' => 'required|max:191'
        ];  

        $this->validate($request, $rules);

        $data = $request->all();

        $chart = Chart::create($data);
    
        return $this->showOne($chart, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Chart $chart)
    {
        $chart = $this->chart->findBy($chart);

        return $this->showOne($chart);
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
    public function update(Request $request, Chart $chart)
    {
        $chart = $this->chart->findBy($chart);

        $rules = [
            'sprintlog_id' => 'required|exists:sprintlogs,id',
            'name' => 'required|max:191'
        ];  

        $this->validate($request, $rules);

        $chart->sprintlog_id = $request->sprintlog_id;
        $chart->name = $request->name;

        $chart->save();

        return $this->showOne($chart);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Chart $chart)
    {
        $chart = $this->chart->findBy($chart);

        $chart->delete();

        return $this->showOne($chart);
    }
}
