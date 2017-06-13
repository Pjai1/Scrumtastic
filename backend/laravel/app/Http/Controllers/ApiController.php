<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Traits\ApiResponses;

class ApiController extends Controller
{
    use ApiResponses;

    public function __construct()
    {
        $this->middleware('auth:api');
    }
}
