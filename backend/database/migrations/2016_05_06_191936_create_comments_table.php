<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateCommentsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('comments', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('parent_id')->unsigned()->nullable();
            $table->integer('event_id')->unsigned()->nullable();
            $table->integer('project_id')->unsigned()->nullable();
//            $table->integer('task_id')->unsigned()->nullable();
            $table->integer('user_id')->unsigned();
//            $table->boolean('is_private');
            $table->string('type', 100)->nullable(); // estimate, mockup, proof
            $table->date('approved_at')->nullable();
            $table->string('subject', 255)->nullable();
            $table->text('body');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::drop('comments');
    }
}
