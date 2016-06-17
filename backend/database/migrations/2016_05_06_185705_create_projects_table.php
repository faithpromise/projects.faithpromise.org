<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

class CreateProjectsTable extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up() {
        Schema::create('projects', function (Blueprint $table) {
            $table->increments('id');
            $table->integer('event_id')->unsigned()->nullable();
            $table->integer('requester_id')->unsigned();
            $table->integer('agent_id')->unsigned();
            $table->string('name', 200);
            $table->text('notes');
            $table->string('status', 50);
            $table->string('default_recipients', 255)->nullable();

            // Purchase
            $table->boolean('is_purchase');
            $table->string('purchase_order', 100);
            $table->dateTime('estimate_sent_at')->nullable();
            $table->dateTime('delivered_at')->nullable();
            $table->integer('production_days')->unsigned()->nullable();

            $table->boolean('is_template');
            $table->boolean('is_notable');
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down() {
        Schema::drop('projects');
    }
}
