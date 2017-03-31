<?php

namespace App\Http\Controllers;

use App\Models\TimelineDay;
use Illuminate\Http\Request;

class TimelineController extends Controller {

    public function index(Request $request) {

        $timeline = TimelineDay::with(['timeline_tasks.project' => function ($query) {
            $query->with('event', 'requester');
        }])->where('agent_id', '=', $request->input('agent_id'))->get();

        return [
            'data' => $timeline
        ];
    }

}
