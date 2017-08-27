<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User;
use App\ProjectUser;
use App\Repositories\UserRepository;
use App\Http\Controllers\ApiController;
use Illuminate\Support\Facades\Mail;
use App\Mail\UserCreated;
use Illuminate\Support\Facades\DB;

class UserController extends ApiController
{
    private $user;

    public function __construct(UserRepository $user) 
    {
        $this->middleware('auth:api', ['except' => ['showUserByEmail', 'store', 'resend', 'verify']]);
        $this->middleware('user.admin', ['only' => ['index']]);
        $this->middleware('user.resources', ['only' => ['showWithComments', 'showUserTeams', 'showUserTasks', 'showUserProjects']]);
    	$this->user = $user;
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = $this->user->find();

        return $this->showAll($users);
    }

    public function showWithComments(User $user)
    {
        $comments = $this->user->findAllComments($user);

        return $this->showAll($comments);
    }

    public function showUserTeams(User $user)
    {
        $teams = $this->user->findAllTeams($user);

        return $this->showAll($teams);
    }

    public function showUserTasks(User $user)
    {
        $tasks = $this->user->findAllTasks($user);

        return $this->showAll($tasks);
    }

    public function showUserProjects(User $user)
    {
        $projects = $this->user->findAllProjects($user);

        return $this->showAll($projects);
    }

    public function showUserByEmail(Request $request)
    {
        $email = $request->email;

        $user = $this->user->findUserByEmail($email);

        return $this->showAll($user);
    }

    public function attachUserToProject(Request $request)
    {
        $rules = [
            'email' => 'required|email|exists:users,email'
        ];

        $this->validate($request, $rules);

        $email = $request->email;

        $user = $this->user->findUserByEmail($email);

        if(count($user) === 0) {
            return $this->errorResponse('No user found by that email', 401);
        }

        $userId = $user[0]->id;
        $userExists = ProjectUser::where('project_id', '=', $request->project_id)->where('user_id', '=', $userId)->first();

        if(!$userExists) {
        
            $projectUser = new ProjectUser;
            $projectUser->project_id = $request->project_id;
            $projectUser->user_id = $user[0]->id;
            $projectUser->save();

            return $this->showAll($user);
        }
        else {
            return $this->errorResponse('User already attached to this project', 409);
        }
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
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed'
        ];

        $this->validate($request, $rules);

        $data = $request->all();
        $data['password'] = bcrypt($request->password);
        $data['verified'] = User::UNVERIFIED_USER;
        $data['verification_token'] = User::generateVerificationCode();
        $data['admin'] = User::REGULAR_USER;

        $user = User::create($data);

        return $this->showOne($user, 201);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show(User $user)
    {
        $user = $this->user->findBy($user);

        return $this->showOne($user);
    }

    public function showAdmins()
    {
        $users = $this->user->findAllAdmins();

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
    public function update(Request $request, User $user)
    {
        $user = $this->user->findBy($user);

        $rules = [
            'email' => 'email|unique:users,email,' . $user->id,
            'password' => 'min:6|confirmed',
            'admin' => 'in:' . User::ADMIN_USER . ',' . User::REGULAR_USER 
        ];

        $this->validate($request, $rules);

        if($request->has('name')) {
            $user->name = $request->name;
        }

        if($request->has('email') && $user->email !== $request->email) {
            $user->email = $request->email;
            $user->verified = User::UNVERIFIED_USER;
            $user->verification_token = User::generateVerificationCode();
        }

        if($request->has('password')) {
           $user->password = bcrypt($request->password);
        }

        if($request->has('admin')) {
            if(!$user->isVerified()) {
                return $this->errorResponse('Only verified users can edit the admin field.', 409);
            }

            $user->admin = $request->admin;
        }

        if(!$user->isDirty()) {
            return $this->errorResponse('You need to specify a different value to modify this user.', 422);
        }

        $user->save();

        return $this->showOne($user);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(User $user)
    {
        $user = $this->user->findBy($user);

        $user->comments()->delete();
        $user->delete();

        return $this->showOne($user);
    }

    public function verify($token)
    {
        $user = $this->user->getToken($token);

        $user->verified = User::VERIFIED_USER;
        $user->verification_token = null;

        $user->save();

        return $this->showMessage('Account verified');
    }

    public function resend(User $user)
    {
        if($user->isVerified()) {
            return $this->errorResponse('This user is already verified', 409);
        }

        retry(5, function() use ($user) { 
                Mail::to($user)->send(new UserCreated($user));
            }, 100);

        return $this->showMessage('Verification email was resent');
    }

    public function logout(Request $request)
    {
        $email = $request->email;

        $user = DB::table('users')->where('email', $email)->get();

        DB::table('oauth_access_tokens')->where('user_id', $user[0]->id)->delete();

        return $this->showMessage('Succesfully logged out');
    }
}
