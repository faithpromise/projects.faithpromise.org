<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use App\Services\TimelineBuilder;

class MainController extends Controller {

    public function index() {

        // TODO: Do not need to re-generate timeline on each request. This is just for dev
        $agents = Agent::with('tasks.project.event')->get();
        foreach ($agents as $agent) {
            TimelineBuilder::createTimeline($agent);
        }

        return view('welcome');
    }

}