<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

use App\Http\Requests;

class ProjectsController extends Controller {

    public function show($id, Request $request) {

//        dd($request->input('with'));

        return Project::with('event.comments','timeline_tasks.agent')->whereId($id)->first();

    }

}
