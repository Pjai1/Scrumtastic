<?php

namespace App\Http\Middleware;

use Closure;
use App\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;
use App\Traits\ApiResponses;

class UserMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        if($request->route('user')) {
            $userRouteId = $request->route('user')->id;
            $userId = $request->user()->id;

            if($userRouteId == $userId) {
                return $response;
            }
            return response()->json(['error' => 'Unauthorized to view this content', 'code' => 401]);
        }
    }
}
