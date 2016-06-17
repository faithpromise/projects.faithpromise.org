<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

use App\Http\Requests;

class ProjectsController extends Controller {

    public function show($id) {

        return [
            'data' => Project::with('event','agent','requester', 'recipients')->whereId($id)->first()
        ];

    }

    public function store(Request $request) {
        dd($request->all());
    }

    public function update($id, Request $request) {
        Project::findOrFail($id)->update($request->all());
    }

    public function updateRecipients($id, Request $request) {
        Project::findOrFail($id)->recipients()->sync($request->input('data'));
    }

}
