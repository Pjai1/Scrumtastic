<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Team;
use App\Repositories\TeamRepository;
use App\Http\Controllers\ApiController;


class TeamController extends ApiController
{
    private $team;

    public function __construct(TeamRepository $team) 
    {
        $this->middleware('auth:api');
    	$this->team = $team;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $teams = $this->team->find();

        return $this->showAll($teams);
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

        $team = Team::create($data);

        return $this->showOne($team, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Team $team)
    {
        $team = $this->team->findBy($team);

        return $this->showOne($team);
    }

    public function showTeamProjects(Team $team)
    {
        $projects = $this->team->findAllProjects($team);

        return $this->showAll($projects);     
    }

    public function showTeamUsers(Team $team)
    {
        $users = $this->team->findAllUsers($team);

        return $this->showAll($users);
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
    public function update(Request $request, Team $team)
    {
        $team = $this->team->findBy($team);

        $rules = [
            'name' => 'required'
        ];

        $this->validate($request, $rules);

        $team->name = $request->name;

        $team->save();

        return $this->showOne($team);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Team $team)
    {
        $team = $this->team->findBy($team);

        $team->projects()->detach();
        $team->users()->detach();
        $team->delete();

        return $this->showOne($team);
    }
}
