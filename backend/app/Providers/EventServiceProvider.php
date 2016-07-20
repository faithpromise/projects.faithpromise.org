<?php

namespace App\Providers;

use App\Listeners\AutoCreateProjectSetupTask;
use App\Listeners\AutoCreatePurchaseTasks;
use App\Listeners\RebuildTimelinesWhenProjectChanges;
use App\Listeners\RebuildTimelineWhenProjectDeleted;
use App\Listeners\RebuildTimelineWhenTaskDeleted;
use App\Listeners\SendComment;
use App\Listeners\SendProjectAssignmentNotification;
use App\Listeners\RebuildTimelineWhenTaskReassigned;
use App\Listeners\UpdateProjectEstimateSent;
use App\Listeners\UpdateProjectOrdered;
use Illuminate\Contracts\Events\Dispatcher as DispatcherContract;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider {
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\ProjectCreated' => [
            AutoCreateProjectSetupTask::class
        ],
        'App\Events\ProjectSaved' => [
            SendProjectAssignmentNotification::class,
            AutoCreatePurchaseTasks::class,
            RebuildTimelinesWhenProjectChanges::class
        ],
        'App\Events\ProjectDeleted' => [
            RebuildTimelineWhenProjectDeleted::class
        ],
        'App\Events\TaskSaved'    => [
            RebuildTimelineWhenTaskReassigned::class,
            UpdateProjectOrdered::class,
            UpdateProjectEstimateSent::class
        ],
        'App\Events\TaskDeleted'    => [
            RebuildTimelineWhenTaskDeleted::class
        ],
        'App\Events\CommentCreated' => [
            SendComment::class
        ]
    ];

    /**
     * Register any other events for your application.
     *
     * @param  \Illuminate\Contracts\Events\Dispatcher $events
     * @return void
     */
    public function boot(DispatcherContract $events) {
        parent::boot($events);

        //
    }
}
