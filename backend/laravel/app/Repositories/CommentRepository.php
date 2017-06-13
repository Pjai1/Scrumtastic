<?php

namespace App\Repositories;

use App\Comment;

class CommentRepository
{
    protected $comment;

    public function __construct(Comment $comment) 
    {
        $this->comment = $comment;
    }

    public function find()
    {
        return $this->comment->get();
    }

    public function findBy(Comment $comment)
    {
        return $comment;
    }
}