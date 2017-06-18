<?php

use App\User;
use App\Project;
use App\Status;
use App\Sprint;
use App\Task;
use App\Team;
use App\Comment;
use App\Notification;
use App\Bug;
use App\Feature;
use App\Story;
use App\SprintLog;
use App\Chart;
use App\ProjectUser;

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

/** @var \Illuminate\Database\Eloquent\Factory $factory */
$incrementCounter = incrementCounter();

$factory->define(User::class, function (Faker\Generator $faker) {
    static $password;

    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => str_random(10),
        'verified' => $verified = $faker->randomElement([User::VERIFIED_USER, User::UNVERIFIED_USER]),
        'verification_token' => $verified == User::VERIFIED_USER ? null : User::generateVerificationCode(),
        'admin' => $verified = $faker->randomElement([User::REGULAR_USER, User::ADMIN_USER])
    ];
});

$factory->define(Project::class, function (Faker\Generator $faker) {

    return [
        'name' => $faker->word,
        'description' => $faker->paragraph(1)
    ];
});

$factory->define(Feature::class, function (Faker\Generator $faker) {

    return [
        'project_id' => Project::all()->random()->id,
        'name' => $faker->word 
    ];
});

$factory->define(Story::class, function (Faker\Generator $faker) {

    return [
        'feature_id' => Feature::all()->random()->id,
        'description' => $faker->paragraph(1) 
    ];
});

$factory->define(Sprint::class, function (Faker\Generator $faker) use ($incrementCounter) {
    $startDate = $faker->dateTimeBetween('next Monday', 'next Monday +7 days');
    $incrementCounter->next();

    return [
        'name' => 'Sprint '.$incrementCounter->current(),
        'project_id' => Project::all()->random()->id,
        'total_storypoints' => $faker->numberBetween(60,80),
        'remaining_storypoints' => $faker->numberBetween(10,30),
        'start_date' => $startDate,
        'end_date' => $faker->dateTimeBetween($startDate, $startDate->format('Y-m-d H:i:s').' +2 days')
    ];
});

$factory->define(Task::class, function (Faker\Generator $faker) {

    return [
        'name' => $faker->word,
        'story_id' => Story::all()->random()->id,
        'status_id' => Status::all()->random()->id,
        'description' => $faker->paragraph(1),
        'total_storypoints' => $faker->numberBetween(6,8),
        'remaining_storypoints' => $faker->numberBetween(1,3)       
    ];
});

$factory->define(Team::class, function (Faker\Generator $faker) {

    return [
        'name' => $faker->word 
    ];
});

$factory->define(Comment::class, function (Faker\Generator $faker) {

    return [
        'task_id' => Task::all()->random()->id,
        'user_id' => User::all()->random()->id,
        'message' => $faker->paragraph(1) 
    ];
});

$factory->define(Notification::class, function (Faker\Generator $faker) {

    return [
        'task_id' => Task::all()->random()->id,
        'message' => $faker->paragraph(1) 
    ];
});

$factory->define(Bug::class, function (Faker\Generator $faker) {

    return [
        'task_id' => Task::all()->random()->id,
        'description' => $faker->paragraph(1) 
    ];
});

$factory->define(SprintLog::class, function (Faker\Generator $faker) {
    $sprintInstance = Sprint::all()->random();

    return [
        'sprint_id' => $sprintInstance->id,
        'date_of_sprint' => $faker->date(),
        'total_storypoints' => $sprintInstance->total_storypoints,
        'remaining_storypoints' => $sprintInstance->remaining_storypoints
    ];
});

$factory->define(Chart::class, function (Faker\Generator $faker) {
    $sprintLogInstance = SprintLog::all()->random();

    return [
        'sprintlog_id' => $sprintLogInstance->id,
        'name' => 'Burndown Chart'
    ];
});

$factory->define(ProjectUser::class, function (Faker\Generator $faker) {

    return [
        'project_id' => Project::all()->random()->id,
        'user_id' => User::all()->random()->id,
        'story_points' => $faker->numberBetween(6,8),
        'admin' => $verified = $faker->randomElement([User::REGULAR_USER, User::ADMIN_USER])
    ];
});

function incrementCounter() 
{
    for($i = 0; $i < 100; $i++) 
    {
        yield $i;
    }
}
