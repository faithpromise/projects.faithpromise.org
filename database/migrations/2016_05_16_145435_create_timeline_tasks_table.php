<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateTimelineTasksTable extends Migration { 
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('timeline_tasks', function (Blueprint $table) {
            $table->increments('id');

            $table->integer('event_id')->unsigned()->nullable();
            $table->integer('project_id')->unsigned()->nullable();
            $table->integer('agent_id')->unsigned();
            $table->integer('task_id')->unsigned();
            $table->bigInteger('timeline_day_id')->unsigned();
            $table->date('timeline_date');
            $table->string('type', 30)->nullable();
            $table->string('name', 100);
            $table->text('notes')->nullable();
            $table->integer('duration')->unsigned();
            $table->dateTime('start_at')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->integer('sort')->unsigned();
            $table->dateTime('completed_at')->nullable();
            $table->boolean('is_start');
            $table->boolean('is_end');
            $table->timestamps();

            $table->unique(['task_id', 'timeline_day_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::drop('timeline_tasks');
    }
}
