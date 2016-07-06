<?php

namespace App\Providers;

use Illuminate\Contracts\Events\Dispatcher as DispatcherContract;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider {
    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'App\Events\ProjectChanged' => [
            'App\Listeners\SendProjectAssignmentNotification'
        ],
        'App\Events\TaskChanged'    => [
            'App\Listeners\UpdateTimelineWhenTaskReassigned',
            'App\Listeners\SendTaskAssignmentNotification'
        ],
        'App\Events\CommentCreated' => [
            'App\Listeners\SendComment'
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
