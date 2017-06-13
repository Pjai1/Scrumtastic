<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\DB;

class ProjectMiddleware
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
        $routePath = $request->route()->uri;

        if($routePath = "api/projects/{project}*") {
            $projectRouteId = $request->route('project')->id;
            $userId = $request->user()->id;

            $reqInstance = DB::table('project_user')->where('project_id', $projectRouteId)->where('user_id', $userId)->get();
            if(!$reqInstance->isEmpty()) {
                return $response;
            }

            return response()->json(['error' => 'Unauthorized to view this content', 'code' => 401]);
        }
        return response()->json(['error' => 'Unauthorized to view this content', 'code' => 401]);
    }
}
