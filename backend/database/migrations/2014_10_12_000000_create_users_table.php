<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('users', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('department_id')->unsigned();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password');
            $table->tinyInteger('monday_hours')->default(0);
            $table->tinyInteger('tuesday_hours')->default(0);
            $table->tinyInteger('wednesday_hours')->default(0);
            $table->tinyInteger('thursday_hours')->default(0);
            $table->tinyInteger('friday_hours')->default(0);
            $table->tinyInteger('saturday_hours')->default(0);
            $table->tinyInteger('sunday_hours')->default(0);
            $table->boolean('is_agent');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::drop('users');
    }
}
