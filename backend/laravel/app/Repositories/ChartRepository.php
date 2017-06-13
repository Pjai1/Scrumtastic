<?php

namespace App\Repositories;

use App\Chart;

class ChartRepository
{
    protected $chart;

    public function __construct(Chart $chart) 
    {
        $this->chart = $chart;
    }

    public function find()
    {
        return $this->chart->get();
    }

    public function findBy(Chart $chart)
    {
        return $chart;
    }
}