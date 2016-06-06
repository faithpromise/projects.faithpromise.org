<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersTableSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {

        DB::table('users')->truncate();

        $this->makeRecord('Brad', 'Roberts', 'bradr@faithpromise.org', 8, true);
        $this->makeRecord('Heather', 'Burson', 'heatherb@faithpromise.org', 4, true);
        $this->makeRecord('Kyle', 'Gilbert', 'kyleg@faithpromise.org', 0, true);
        $this->makeRecord('Michelle', 'Hearon', 'michelleh@faithpromise.org', 6, false);
        $this->makeRecord('Kelsey', 'Rucker', 'kelseyr@faithpromise.org', 6, false);
        $this->makeRecord('Josh', 'Whitehead', 'joshw@faithpromise.org', 6, false);
        $this->makeRecord('Jennifer', 'Spencer', 'jennifers@faithpromise.org', 6, false);
    }

    private function makeRecord($first_name, $last_name, $email, $friday_hours, $is_agent) {
        (new \App\Models\User([
            'first_name'      => $first_name,
            'last_name'       => $last_name,
            'email'           => $email,
            'monday_hours'    => 6,
            'tuesday_hours'   => 6,
            'wednesday_hours' => 6,
            'thursday_hours'  => 6,
            'friday_hours'    => $friday_hours,
            'is_agent'        => $is_agent,
            'password'        => bcrypt('secret')
        ]))->save();
    }
}
