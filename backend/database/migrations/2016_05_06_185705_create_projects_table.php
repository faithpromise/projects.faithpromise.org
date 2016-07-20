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
            $table->text('notes')->nullable();;

            // Purchase
            $table->boolean('is_purchase')->default(false);
            $table->string('purchase_order', 100);
            $table->integer('production_days')->unsigned()->default(0);

            // Status
            $table->boolean('is_template')->default(false);
            $table->boolean('is_backlog')->default(false);
            $table->dateTime('estimate_sent_at')->nullable();
            $table->dateTime('approved_at')->nullable();
            $table->dateTime('ordered_at')->nullable();
            $table->dateTime('closed_at')->nullable();
            $table->dateTime('due_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
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
