<?php

namespace App\Providers;

use App\Models\Project;
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
