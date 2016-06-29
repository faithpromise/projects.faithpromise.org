<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Illuminate\Http\Request;

use App\Http\Requests;

class ProjectsController extends Controller {

    public function show($id) {

        return [
            'data' => Project::with('event', 'agent', 'requester', 'recipients')->whereId($id)->first()
        ];

    }

    public function store(Request $request) {

        $project = new Project();
        $project->fillMore($request->input('data'))->save();

        $this->update_recipients($project, $request->input('data'));
    }

    public function update($id, Request $request) {

        $project = Project::findOrFail($id);
        $project->fillMore($request->input('data'))->save();

        $this->update_recipients($project, $request->input('data'));
    }

    public function updateRecipients($id, Request $request) {
        $this->update_recipients(Project::findOrFail($id), $request->input('data'));
    }

    private function update_recipients($project, $data) {
        if (array_key_exists('recipients', $data)) {
            $project->recipients()->sync($data['recipients']);
        }
    }

}
