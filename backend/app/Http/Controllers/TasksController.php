<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Http\Request;

use App\Http\Requests;

class TasksController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {

        $query = Task::with('agent')->orderBy('sort', 'asc');

        if ($request->has('project_id')) {
            $query->whereProjectId($request->input('project_id'));
        }

        $tasks = $query->get()->sortBy(function($task) {
           return (new Carbon($task->estimated_start_date))->timestamp . ' ' . sprintf('%08d', $task->sort);
        })->values();

        return [
            'data' => $tasks
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
        $new_task = Task::find($id);
        $new_task->fillMore($request->input('data'))->save();
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
    }
}
