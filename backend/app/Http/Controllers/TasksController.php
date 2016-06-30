<?php

namespace App\Http\Controllers;

use App\Events\TaskChanged;
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

        $task = new Task();
        $task->fillMore($request->input('data'))->save();

        Event::fire(new TaskChanged($task));
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
        $old_task = Task::find($id);
        $new_task = Task::find($id);
        $new_task->fillMore($request->input('data'))->save();
        Event::fire(new TaskChanged($new_task, $old_task));
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
        Event::fire(new TaskChanged($task));
    }
}
