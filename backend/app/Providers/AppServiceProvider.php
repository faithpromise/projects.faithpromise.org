<?php

namespace App\Providers;

use App\Events\ProjectDeleted;
use App\Events\ProjectSaved;
use App\Events\ProjectCreated;
use App\Events\TaskSaved;
use App\Models\Project;
use App\Models\Task;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot() {

        /*
        |--------------------------------------------------------------------------
        | Project events
        |--------------------------------------------------------------------------
        */
        Project::saving(function(Project $project) {
            if (!$project->getIsPurchase()) {
                $project->setProductionDays(0);
            }
        });

        Project::created(function(Project $project) {
            Event::fire(new ProjectCreated($project));
        });

        Project::saved(function(Project $project) {

            $old_project = new Project();
            $old_project->unguard();
            $old_project->fill($project->getOriginal());

            Event::fire(new ProjectSaved($project, $old_project));
        });

        Project::deleted(function(Project $project) {
            Event::fire(new ProjectDeleted($project));
        });

        /*
        |--------------------------------------------------------------------------
        | Task events
        |--------------------------------------------------------------------------
        */
        Task::saved(function(Task $task) {
            $old_task = new Task();
            $old_task->unguard();
            $old_task->fill($task->getOriginal());

            Event::fire(new TaskSaved($task, $old_task));
        });

        Task::deleted(function(Task $task) {
            Event::fire(new TaskSaved($task));
        });

    }

    /**
     * Register any application services.
     *
     * @return void
     */
    public function register() {
        //
    }


}
