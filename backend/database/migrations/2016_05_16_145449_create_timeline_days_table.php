<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateTimelineDaysTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('timeline_days', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->integer('agent_id')->unsigned();
            $table->date('day');
            $table->integer('capacity')->unsigned();
            $table->timestamps();
            $table->unique(['agent_id', 'day']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::drop('timeline_days');
    }
}
