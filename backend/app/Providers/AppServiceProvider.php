<?php

namespace App\Providers;

use App\Events\ProjectChanged;
use App\Events\ProjectCreated;
use App\Models\Project;
use App\Services\TimelineBuilder;
use Carbon\Carbon;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot() {

        Project::saving(function(Project $project) {

            if (!$project->getIsPurchase()) {
                $project->setProductionDays(0);
            }

        });

        Project::saved(function(Project $project) {

            // TODO: Put this in an event listener

            $old_due_at = new Carbon($project->getOriginal('due_at'));
            $new_due_at = new Carbon($project->due_at);

            // Due date changed
            if ($old_due_at->ne($new_due_at)) {

                // Get all agents that have tasks in this project and update their timeline
                foreach ($project->incomplete_tasks->pluck('agent_id') as $agent_id) {
                    TimelineBuilder::createTimeline($agent_id);
                }

            }

            Event::fire(new ProjectCreated($project));
            Event::fire(new ProjectChanged($project));

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
