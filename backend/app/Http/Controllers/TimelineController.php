<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Carbon\Carbon;

class TimelineController extends Controller {

    public function index() {

        $start = Carbon::today();
        $end = Carbon::today()->addDays(30);

        $agents = Agent::with(['timeline_days.timeline_tasks.project' => function($query) {
            $query->with('event','requester');
        }])->get();


//        $agents = Agent::with(
//            [
//                'timeline_days' => function ($query) use ($start, $end) {
//                    $query->whereDate('day', '>=', $start)->whereDate('day', '<=', $end)->with('timeline_tasks.project.event');
//                }
//            ])->get();

//        foreach ($agents as $agent) {
//            $agent->timeline = [];
//
//            foreach ($agent->timeline_days as $timeline_day) {
//                $agent->timeline[$timeline_day->day->format('Y-m-d')] = $timeline_day;
//            }
//        }

        return [
            'data' => $agents
        ];
    }

}
