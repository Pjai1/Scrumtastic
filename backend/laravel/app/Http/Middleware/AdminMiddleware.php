<?php

namespace App\Http\Middleware;

use Closure;

class AdminMiddleware
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

        if($request->user()->isAdmin()) {
            return $response;
        }

        return response()->json(['error' => 'Unauthorized to view this content', 'code' => 401]);
    }
}
