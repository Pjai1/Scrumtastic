<?php

namespace App\Repositories;

use App\Feature;

class FeatureRepository
{
    protected $feature;

    public function __construct(Feature $feature) 
    {
        $this->feature = $feature;
    }

    public function find()
    {
        return $this->feature->get();
    }

    public function findBy(Feature $feature)
    {
        return $feature;
    }

    public function findAllStories(Feature $feature)
    {
        return $this->feature->where('id', $feature->id)->with('stories')->get();
    }
}