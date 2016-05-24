<?php

use App\Models\Event;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class TasksTableSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {

        DB::table('tasks')->truncate();

        $today = Carbon::today();

        $brad = User::whereEmail('bradr@faithpromise.org')->first();
        $heather = User::whereEmail('heatherb@faithpromise.org')->first();
        $maple_farms = Event::whereName('July 3rd at Maple Farms')->first();

        $maple_farms_shirt = Project::where('event_id', '=', $maple_farms->id)->whereName('T-Shirt')->first();

        $this->makeRecord($maple_farms->id, null, $brad->id, 'Schedule Meeting', 20, $today->copy()->addDays(2));
        $this->makeRecord(null, $maple_farms_shirt->id, $heather->id, 'Design', 480, $today->copy()->addDays(42));
    }

    private function makeRecord($event_id, $project_id, $agent_id, $name, $duration, $due_at) {
        (new \App\Models\Task([
            'event_id'   => $event_id,
            'project_id' => $project_id,
            'agent_id'   => $agent_id,
            'name'       => $name,
            'duration'   => $duration,
            'due_at'     => $due_at
        ]))->save();
    }

}
