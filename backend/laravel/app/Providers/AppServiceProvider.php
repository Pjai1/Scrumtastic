<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Mail;
use App\User;
use App\Mail\UserCreated;
use App\Mail\UserMailChanged;
use Illuminate\Support\Facades\Validator;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Schema::defaultStringLength(191);

        User::created(function($user) {
            retry(5, function() use ($user) { 
                Mail::to($user)->send(new UserCreated($user));
            }, 100);
        });

        User::updated(function($user) {
            if($user->isDirty('email')) {
                retry(5, function() use ($user) {
                    Mail::to($user)->send(new UserMailChanged($user));
                }, 100);
            }
        });

        Validator::extend('greater_than_or_equal', function ($attribute, $value, $parameters, $validator) {
            $requestInput = $validator->getData();
            // if($value <= $requestInput['total_storypoints']) {
            //     return true;
            // }
            // return false;

            return $value <= $requestInput['total_storypoints'];
        });

        Validator::replacer('greater_than_or_equal', function ($attribute, $value, $parameters, $validator) {
            return "remaining storypoints can't be bigger than total storypoints";
        });
    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }
}
