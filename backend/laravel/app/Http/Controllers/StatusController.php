<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Status;
use App\Repositories\StatusRepository;
use App\Http\Controllers\ApiController;


class StatusController extends ApiController
{
    private $status;

    public function __construct(StatusRepository $status) 
    {
    	$this->status = $status;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $statuses = $this->status->find();

        return $this->showAll($statuses);
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
            'name' => 'required'
        ];

        $this->validate($request, $rules);

        $data = $request->all();

        $status = Status::create($data);

        return $this->showOne($status, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Status $status)
    {
        $status = $this->status->findBy($status);

        return $this->showOne($status);
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
    public function update(Request $request, Status $status)
    {
        $status = $this->status->findBy($status);

        $rules = [
            'name' => 'required'
        ];

        $this->validate($request, $rules);

        $status->name = $request->name;

        $status->save();

        return $this->showOne($status);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Status $status)
    {
        $status = $this->status->findBy($status);

        $status->delete();

        return $this->showOne($status);
    }
}
