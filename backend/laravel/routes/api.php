<?php

use Illuminate\Http\Request;
use App\Notifications\TaskCompleted;
use App\User;
use App\Repositories\UserRepository;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/** 
 * Bugs
**/

Route::resource('bugs', 'BugController', ['except' => ['create', 'edit']]);

/** 
 * Charts
**/

Route::resource('charts', 'ChartController', ['except' => ['create', 'edit']]);

/** 
 * Comments
**/

Route::resource('comments', 'CommentController', ['except' => ['create', 'edit']]);

/** 
 * Features
**/

Route::resource('features', 'FeatureController', ['except' => ['create', 'edit']]);
Route::get('features/{feature}/stories', 'FeatureController@showFeatureStories');
/** 
 * Notifications
**/

Route::resource('notifications', 'NotificationController', ['except' => ['create', 'edit']]);

/** 
 * Projects
**/

Route::resource('projects', 'ProjectController', ['except' => ['create', 'edit']]);
Route::get('projects/{project}/users', 'ProjectController@showProjectUsers');
Route::get('projects/{project}/sprints', 'ProjectController@showProjectSprints');
Route::get('projects/{project}/stories', 'ProjectController@showProjectStories');
Route::get('projects/{project}/features', 'ProjectController@showProjectFeatures');
Route::get('projects/{project}/teams', 'ProjectController@showProjectTeams');

/** 
 * Sprints
**/

Route::resource('sprints', 'SprintController', ['except' => ['create', 'edit']]);
Route::get('sprints/{sprint}/sprintlogs', 'SprintController@showSprintLogs');
Route::get('sprints/{sprint}/tasks', 'SprintController@showSprintTasks');
Route::get('sprints/{sprint}/stories', 'SprintController@showSprintStories');

/** 
 * SprintLogs
**/

Route::resource('sprintlogs', 'SprintLogController', ['except' => ['create', 'edit']]);
Route::get('sprintlog/{id}', 'SprintLogController@showAllLogsById');

/** 
 * Statuses
**/

Route::resource('statuses', 'StatusController', ['except' => ['create', 'edit']]);

/** 
 * Stories
**/

Route::resource('stories', 'StoryController', ['except' => ['create', 'edit']]);
Route::get('stories/{story}/tasks', 'StoryController@showStoryTasks');
Route::post('sprintstories', 'StoryController@storeWithSprint');
Route::post('storestorypivot', 'StoryController@storePivotSprint');

/** 
 * Tasks
**/

Route::resource('tasks', 'TaskController', ['except' => ['create', 'edit']]);
Route::get('tasks/{task}/users', 'TaskController@showTaskUsers');
Route::get('tasks/{task}/comments', 'TaskController@showTaskComments');
Route::get('tasks/{task}/notifications', 'TaskController@showTaskNotifications');
Route::get('tasks/{task}/bugs', 'TaskController@showTaskBugs');
Route::get('tasks/{task}/statuses', 'TaskController@showTaskStatus');

/** 
 * Teams
**/

Route::resource('teams', 'TeamController', ['except' => ['create', 'edit']]);
Route::get('teams/{team}/users', 'TeamController@showTeamUsers');
Route::get('teams/{team}/projects', 'TeamController@showTeamProjects');

/** 
 * Users
**/

Route::resource('users', 'UserController', ['except' => ['create', 'edit']]);
Route::get('adminusers', 'UserController@showAdmins');
Route::get('users/{user}/comments', 'UserController@showWithComments');
Route::get('users/{user}/teams', 'UserController@showUserTeams');
Route::get('users/{user}/tasks', 'UserController@showUserTasks');
Route::get('users/{user}/projects', 'UserController@showUserProjects');
Route::name('verify')->get('users/verify/{token}', 'UserController@verify');
Route::name('resend')->get('users/{user}/resend', 'UserController@resend');
Route::get('slack', function() {
    $user = User::find(10);

    $admin = User::find(1);

    var_dump($user);

    $admin->notify(new TaskCompleted($user));
});

Route::post('userid', 'UserController@showUserByEmail');
Route::post('attachuser', 'UserController@attachUserToProject');
Route::post('attachtask', 'TaskController@attachUserToTask');
Route::post('oauth/token', '\Laravel\Passport\Http\Controllers\AccessTokenController@issueToken');
Route::post('logout', 'UserController@logout');
Route::delete('deleteprojectuser', 'ProjectController@deleteProjectUser');