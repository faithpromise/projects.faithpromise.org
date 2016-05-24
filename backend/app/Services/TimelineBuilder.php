<?php

namespace App\Services;

use App\Models\Agent;
use App\Models\TimelineDay;
use App\Models\TimelineTask;
use Carbon\Carbon;

class TimelineBuilder {

    public static function createTimeline(Agent $agent) {

        TimelineTask::where('agent_id', '=', $agent->id)->delete();
        TimelineDay::where('agent_id', '=', $agent->id)->delete();

//        self::populateDays($agent);
        self::buildTimeline($agent, $agent->tasks, Carbon::today(), 0, []);

    }

    private static function buildTimeline(Agent $agent, $tasks, Carbon $day, $capacity_remaining = 0) {

        $timeline_day = TimelineDay::where('agent_id', '=', $agent->id)->whereDate('day', '=', $day)->first();

        if (is_null($timeline_day)) {
            $timeline_day = new TimelineDay([
                'agent_id' => $agent->id,
                'day'      => $day
            ]);
        }

        // Update day capacity
        $timeline_day->capacity = $agent->getCapacity($day);

        $capacity_remaining = $capacity_remaining ?: $timeline_day->capacity;


        // TODO: Need to account for `start_at` on the task


        if ($tasks->count() AND $capacity_remaining) {

            $task = $tasks->first();
            $tasks->shift(); // Remove first task from collection

            $timeline_task = new TimelineTask;

            $timeline_task->event_id = $task->event_id;
            $timeline_task->project_id = $task->project_id;
            $timeline_task->agent_id = $task->agent_id;
            $timeline_task->task_id = $task->id;
            $timeline_task->timeline_date = $timeline_day->day;
            $timeline_task->name = $task->name;
            $timeline_task->comment = $task->comment;
            $timeline_task->duration = $task->duration;
            $timeline_task->start_at = $task->start_at;
            $timeline_task->due_at = $task->due_at;
            $timeline_task->completed_at = $task->completed_at;
            $timeline_task->is_start = $task->is_start;
            $timeline_task->is_end = true;

            if ($task->duration > $capacity_remaining) {

                // Create a new task with the difference
                $new_task = clone $task;

                $new_task->duration = ($task->duration - $capacity_remaining);
                $new_task->is_start = false;
                $tasks->prepend($new_task);

                // Assign remaining minutes to this task
                $timeline_task->duration = $capacity_remaining;
                $timeline_task->is_end = false;

                $capacity_remaining = 0;

            } else {
                $capacity_remaining = $capacity_remaining - $task->duration;
            }

            if (!$timeline_day->exists) {
                $timeline_day->save();
            }

            $timeline_day->timeline_tasks()->save($timeline_task);

        }

        if ($capacity_remaining == 0) {
            $day->addDay();
        }

        if ($tasks->count() > 0) {
            self::buildTimeline($agent, $tasks, $day, $capacity_remaining);
        }

    }

    private static function buildTimeline2(Agent $agent, $tasks, Carbon $day, $capacity_remaining = 0, $timeline_tasks) {

        $timeline_day = TimelineDay::where('agent_id', '=', $agent->id)->whereDate('day', '=', $day)->first();

        $capacity_remaining = $capacity_remaining ?: $timeline_day->capacity;

        if ($tasks->count() AND $capacity_remaining) {

            $task = $tasks->first();
            $tasks->shift(); // Remove first task from collection

            $timeline_task = new TimelineTask;
            $timeline_task->event_id = $task->event_id;
            $timeline_task->project_id = $task->project_id;
            $timeline_task->agent_id = $task->agent_id;
            $timeline_task->task_id = $task->id;
            $timeline_task->name = $task->name;
            $timeline_task->comment = $task->comment;
            $timeline_task->duration = $task->duration;
            $timeline_task->start_at = $task->start_at;
            $timeline_task->due_at = $task->due_at;
            $timeline_task->completed_at = $task->completed_at;
            $timeline_task->is_start = $task->is_start;
            $timeline_task->is_end = true;

            if ($task->duration > $capacity_remaining) {

                // Create a new task with the difference
                $new_task = clone $task;

                $new_task->duration = ($task->duration - $capacity_remaining);
                $new_task->is_start = false;
                $tasks->prepend($new_task);

                // Assign remaining minutes to this task
                $timeline_task->duration = $capacity_remaining;
                $timeline_task->is_end = false;

                $capacity_remaining = 0;

            } else {
                $capacity_remaining = $capacity_remaining - $task->duration;
            }

            $timeline_day->timeline_tasks()->save($timeline_task);


        }

        if ($capacity_remaining == 0) {
            $day->addDay();
        }

        if ($tasks->count() > 0) {
            self::buildTimeline($agent, $tasks, $day, $capacity_remaining, $timeline_tasks);
        }

    }

    private static function populateDays(Agent $agent) {

        for ($i = 0; $i < 60; $i++) {

            $day = Carbon::today()->addDays($i);

            $timeline_day = new TimelineDay([
                'day'      => $day,
                'capacity' => $agent->getCapacity($day)
            ]);

            $agent->timeline_tasks()->save($timeline_day);

        }

    }

}