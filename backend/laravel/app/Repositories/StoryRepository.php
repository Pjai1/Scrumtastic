<?php

namespace App\Repositories;

use App\Story;

class StoryRepository
{
    protected $story;

    public function __construct(Story $story) 
    {
        $this->story = $story;
    }

    public function find()
    {
        return $this->story->get();
    }

    public function findBy(Story $story)
    {
        return $story;
    }
}