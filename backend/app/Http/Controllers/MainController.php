<?php

namespace App\Http\Controllers;

use App\Models\Agent;

class MainController extends Controller {

    public function index() {

        $agents = Agent::with('tasks')->get();

        dd($agents);

        return view('welcome');
    }

}