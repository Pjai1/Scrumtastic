<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\User;
use App\Status;
use App\Project;
use App\Sprint;
use App\Task;
use App\Team;
use App\Comment;
use App\Notification;
use App\Bug;
use App\Feature;
use App\Story;
use App\Chart;
use App\SprintLog;
use App\ProjectUser;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        User::truncate();
        Status::truncate();
        Project::truncate();
        Sprint::truncate();
        Task::truncate();
        Team::truncate();
        Comment::truncate();
        Notification::truncate();
        Bug::truncate();
        Feature::truncate();
        Story::truncate();
        SprintLog::truncate();
        Chart::truncate();
        ProjectUser::truncate();
        DB::table('project_team')->truncate();
        DB::table('project_user')->truncate();
        DB::table('task_user')->truncate();
        DB::table('team_user')->truncate();
        DB::table('sprint_story')->truncate();

        User::flushEventListeners();
        Status::flushEventListeners();
        Project::flushEventListeners();
        Sprint::flushEventListeners();
        Task::flushEventListeners();
        Team::flushEventListeners();
        Comment::flushEventListeners();
        Notification::flushEventListeners();
        Bug::flushEventListeners();
        Feature::flushEventListeners();
        Story::flushEventListeners();
        SprintLog::flushEventListeners();
        Chart::flushEventListeners();
        ProjectUser::flushEventListeners();


        $usersQuantity = 5;
        $commentsQuantity = 10;
        $seedQuantity = 20;

        factory(User::class, $usersQuantity)->create();

        DB::table('statuses')->insert([
            'name' => 'Unassigned'
        ]);

        DB::table('statuses')->insert([
            'name' => 'To Do'
        ]);

        DB::table('statuses')->insert([
            'name' => 'In Progress'
        ]);

        DB::table('statuses')->insert([
            'name' => 'Completed'
        ]);

        factory(Project::class, $seedQuantity)->create();
        factory(Sprint::class, $seedQuantity)->create();
        factory(Feature::class, $seedQuantity)->create();
        factory(Story::class, $seedQuantity)->create()->each(
            function ($story) {
                $sprints = Sprint::all()->random(mt_rand(1,20))->pluck('id');

                $story->sprints()->attach($sprints);
            }
        );    
        factory(Task::class, $seedQuantity)->create()->each(
            function ($task) {
                $users = User::all()->random(mt_rand(1,5))->pluck('id');

                $task->users()->attach($users);
            }
        );   
        factory(Team::class, $seedQuantity)->create()->each(
            function ($team) {
                $projects = Project::all()->random(mt_rand(1,20))->pluck('id');
                $users = User::all()->random(mt_rand(1,5))->pluck('id');

                $team->projects()->attach($projects);
                $team->users()->attach($users);
            }
        );     
        factory(Comment::class, $commentsQuantity)->create();  
        factory(Notification::class, $seedQuantity)->create();
        factory(Bug::class, $seedQuantity)->create();
        factory(SprintLog::class, $seedQuantity)->create();
        factory(Chart::class, $seedQuantity)->create();
        factory(ProjectUser::class, $seedQuantity)->create();
    }
}
