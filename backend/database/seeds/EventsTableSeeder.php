<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventsTableSeeder extends Seeder {
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {

        DB::table('events')->truncate();

        (new \App\Models\Event(['name' => 'July 3rd at Maple Farms']))->save();
        (new \App\Models\Event(['name' => 'GLS']))->save();
    }

}
