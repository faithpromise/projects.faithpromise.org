<?php

use App\Models\Event;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProjectsTableSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {

        DB::table('projects')->truncate();

        $today = Carbon::today();

        $maple_farms = Event::whereName('July 3rd at Maple Farms')->first();
        $gls = Event::whereName('GLS')->first();
        $michelle = User::whereEmail('michelleh@faithpromise.org')->first();
        $kelsey = User::whereEmail('kelseyr@faithpromise.org')->first();
        $brad = User::whereEmail('bradr@faithpromise.org')->first();
        $heather = User::whereEmail('heatherb@faithpromise.org')->first();
        $josh = User::whereEmail('joshw@faithpromise.org')->first();
        $jennifer = User::whereEmail('jennifers@faithpromise.org')->first();

        $this->makeRecord($maple_farms->id, $michelle->id, $heather->id, 'Flyer', '', 'new', false, true, $today->copy()->addDays(42));
        $this->makeRecord($maple_farms->id, $michelle->id, $heather->id, 'T-Shirt', '', 'new', false, true, $today->copy()->addDays(42));
        $this->makeRecord($maple_farms->id, $michelle->id, $heather->id, 'Invite Card', '', 'new', false, true, $today->copy()->addDays(42));
        $this->makeRecord($maple_farms->id, $michelle->id, $brad->id, 'Website Promo', '', 'new', false, true, $today->copy()->addDays(42));

        $this->makeRecord($gls->id, $josh->id, $heather->id, 'Invite Card', '', 'new', false, true, $today->copy()->addDays(21));

        $this->makeRecord(null, $kelsey->id, $brad->id, 'New Family Gift Bags', '', 'new', false, true, $today->copy()->addDays(21));
        $this->makeRecord(null, $jennifer->id, $heather->id, 'New Kid Rave Logo', '', 'new', false, true, $today->copy()->addDays(42));

    }

    private function makeRecord($event_id, $requester_id, $agent_id, $name, $notes, $status, $is_template, $is_notable, $due_at) {
        (new \App\Models\Project([
            'event_id'     => $event_id,
            'requester_id' => $requester_id,
            'agent_id'     => $agent_id,
            'name'         => $name,
            'notes'        => $notes,
            'status'       => $status,
            'is_template'  => $is_template,
            'is_notable'   => $is_notable,
            'due_at'       => $due_at
        ]))->save();
    }
}
