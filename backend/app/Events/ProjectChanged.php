<?php

namespace App\Events;

use App\Models\Project;
use Illuminate\Queue\SerializesModels;

class ProjectChanged extends Event {

    use SerializesModels;

    public $new_project;
    public $old_project;

    /**
     * Create a new event instance.
     *
     * @param Project $new_project
     * @param Project $old_project
     */
    public function __construct(Project $new_project, Project $old_project = null) {
        $this->new_project = $new_project;
        $this->old_project = $old_project;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array
     */
    public function broadcastOn() {
        return [];
    }

}
