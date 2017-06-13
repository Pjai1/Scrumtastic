<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Notification;
use App\Repositories\NotificationRepository;
use App\Http\Controllers\ApiController;

class NotificationController extends ApiController
{
    private $notification;

    public function __construct(NotificationRepository $notification) 
    {
        $this->middleware('auth:api');
    	$this->notification = $notification;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $notifications = $this->notification->find();

        return $this->showAll($notifications);
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
            'task_id' => 'required|exists:tasks,id',
            'message' => 'required'
        ];

        $this->validate($request, $rules);

        $data = $request->all();

        $notification = Notification::create($data);

        return $this->showOne($notification, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Notification $notification)
    {
        $notification = $this->notification->findBy($notification);

        return $this->showOne($notification);
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
    public function update(Request $request, Notification $notification)
    {
        $notification = $this->notification->findBy($notification);

        $rules = [
            'task_id' => 'required|exists:tasks,id',
            'message' => 'required'
        ];

        $this->validate($request, $rules);

        $notification->task_id = $request->task_id;
        $notification->message = $request->message;

        $notification->save();

        return $this->showOne($notification);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Notification $notification)
    {
        $notification = $this->notification->findBy($notification);

        $notification->delete();

        return $this->showOne($notification);
    }
}
