<?php

namespace App\Repositories;

use App\Notification;

class NotificationRepository
{
    protected $notification;

    public function __construct(Notification $notification) 
    {
        $this->notification = $notification;
    }

    public function find()
    {
        return $this->notification->get();
    }

    public function findBy(Notification $notification)
    {
        return $notification;
    }
}