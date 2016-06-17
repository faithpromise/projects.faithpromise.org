<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Message;
use App\Models\Project;
use Illuminate\Http\Request;

use App\Http\Requests;

class CommentsController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {
        $event_id = $request->input('event_id');
        $project_id = $request->input('project_id');

//        $comments = Message::with('sender')->with(['replies' => function($query) {
//            $query->with('sender')->orderBy('created_at', 'asc');
//        }])->orderBy('created_at', 'desc');

        $comments = Comment::with('sender')->with('recipients')->with('parent')->orderBy('created_at', 'desc');

        if ($project_id) {
            $project = Project::find($project_id);
            $comments->where('project_id', '=', $project_id);
            if ($project->event_id) {
                $comments->orWhere('event_id', '=', $project->event_id);
            }
        } else if ($event_id) {
            $comments->where('event_id', '=', $event_id);
        } else {
            $comments->limit(20);
        }

        return [
            'data' => $comments->get()
        ];

    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {
        $data = $request->input('data');
        $message = Message::create($data);
        $message->recipients()->attach($data['recipients']);
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {
        Message::with('replies')->find($id);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {
        //
    }
}
