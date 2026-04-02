<?php

namespace App\Http\Controllers\main;

use App\Http\Controllers\Controller;

class DashboardController extends Controller
{
    public function main()
    {
        return view('app/dashboard');
    }
}