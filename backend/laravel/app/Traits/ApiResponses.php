<?php

namespace App\Traits;

use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

trait ApiResponses 
{
    private function successResponse($data, $code) 
    {
        return response()->json($data, $code);
    }

    protected function errorResponse($message, $code)
    {
        return response()->json(['error' => $message, 'code' => $code], $code);
    }

    protected function showAll(Collection $collection, $code = 200)
    {
        if($collection->isEmpty()) {
            return $this->successResponse($collection, $code);
        }
        // $transformer = $collection->first()->transformer;

        // $collection = $this->transformData($collection, $transformer);
        // caching disabled for now, was delaying DOM updates
        // $collection = $this->cacheResponse($collection);

        return $this->successResponse($collection, $code);
    }

    protected function showOne(Model $instance, $code = 200)
    {
        // $transformer = $instance->first()->transformer;

        // $instance = $this->transformData($instance, $transformer);

        return $this->successResponse($instance, $code);
    }

    protected function showMessage($message, $code = 200)
    {
        return $this->successResponse(['data' => $message], $code);
    }

    // transformers aren't properly working with pivot tables -> need to look into this
    // protected function transformData($data, $transformer)
    // {
    //     $transformation = fractal($data, new $transformer);

    //     return $transformation->toArray();
    // }

    protected function cacheResponse($data)
    {
        $url = request()->url();

        return Cache::remember($url, 30/60, function() use ($data) {
            return $data;
        });
    }
}