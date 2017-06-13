<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Comment;
use App\Repositories\CommentRepository;
use App\Http\Controllers\ApiController;

class CommentController extends ApiController
{
    private $comment;

    public function __construct(CommentRepository $comment) 
    {
        $this->middleware('auth:api');
    	$this->comment = $comment;
    }
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $comments = $this->comment->find();

        return $this->showAll($comments);
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
            'user_id' => 'required|exists:users,id',
            'message' => 'required'
        ];

        $this->validate($request, $rules);

        $data = $request->all();

        $comment = Comment::create($data);

        return $this->showOne($comment, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(Comment $comment)
    {
        $comment = $this->comment->findBy($comment);

        return $this->showOne($comment);
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
    public function update(Request $request, Comment $comment)
    {
        $comment = $this->comment->findBy($comment);

        $rules = [
            'task_id' => 'required|exists:tasks,id',
            'user_id' => 'required|exists:users,id',
            'message' => 'required'
        ];

        $this->validate($request, $rules);

        $comment->task_id = $request->task_id;
        $comment->user_id = $request->user_id;
        $comment->message = $request->message;

        $comment->save();

        return $this->showOne($comment);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Comment $comment)
    {
        $comment = $this->comment->findBy($comment);

        $comment->delete();

        return $this->showOne($comment);
    }
}
