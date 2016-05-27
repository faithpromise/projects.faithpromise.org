<?php

namespace App\Http\Controllers;

use App\Events\TaskCreated;
use App\Models\Task;
use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Event;

class TasksController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {

        $query = Task::with('agent')->orderBy('sort', 'asc');

        if ($request->has('project_id')) {
            $query->whereProjectId($request->input('project_id'));
        }

        return [
            'data' => $query->get()
        ];
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {
        $task = Task::create($request->input('data'));
        Event::fire(new TaskCreated($task));
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {
        return [
            'data' => Task::find($id)
        ];
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {
        $task = Task::find($id);
        $task->update($request->input('data'));
        Event::fire(new TaskUpdated($task));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {
        $task = Task::find($id);
        $task->delete();
        Event::fire(new TaskDeleted($task));
    }
}
