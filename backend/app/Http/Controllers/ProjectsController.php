<?php

namespace App\Http\Controllers;

use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;
use App\Http\Requests;
use Intervention\Image\Facades\Image;

class ProjectsController extends Controller {

    public function index(Request $request) {

        $query = Project::with('requester');
        $name = $request->input('name');
        $type = $request->input('type');
        $agent_id = $request->input('agent_id');
        $order_by = $request->input('order_by', 'status');

        if ($name) {
            $query->where('name', 'like', '%' . $name . '%');
        }

        if ($type === 'pending') {
            $query->pending();
        }

        if ($agent_id) {
            $query->where('agent_id', '=', $agent_id);
        }

        if ($order_by === 'status') {
            $query->orderBy('ordered_at', 'asc')->orderBy('approved_at', 'desc')->orderBy('is_backlog', 'desc');
        }

        $data = $query->get();

        return [
            'data' => $data
        ];
    }

    public function show($id) {

        return [
            'data' => Project::with('event', 'agent', 'requester', 'recipients')->whereId($id)->first()
        ];

    }

    public function store(Request $request) {
        $project = new Project();
        $project->fillMore($request->input('data'))->save();
        $this->update_recipients($project, $request->input('data'));

        return ['data' => $project];
    }

    public function update($id, Request $request) {
        $project = Project::find($id);
        $project->fillMore($request->input('data'))->save();
        $this->update_recipients($project, $request->input('data'));

        return ['data' => $project];
    }

    public function uploadThumb($id, Request $request) {

        /** @var Project $project */
        $project = Project::find($id);
        $file = $request->file('file')[0];
        $timestamp = Carbon::now()->timestamp;

        $path_info = pathinfo($file->getClientOriginalName());
        $project->setThumbFileName($timestamp . '.' . $path_info['extension']);
        $project->save();

        $file->move(storage_path('project-thumbs'), $project->getThumbPath());

    }

    public function thumb($id) {
        /** @var Project $project */
        $project = Project::find($id);
        $img = Image::make($project->getThumbPath())->fit(200, 200);

        return $img->response($project->getThumbExtension());
    }

    private function update_recipients(Project $project, $data) {
        if (array_key_exists('recipients', $data)) {
            $recipients = array_pluck($data['recipients'], 'id');
            $project->recipients()->sync($recipients);
        }
    }

}
