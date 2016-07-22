<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Project
 * @package App\Models
 *
 * @property string full_name;
 * @property User requester;
 *
 */
class Project extends Model {

    use SoftDeletes;

    protected $dates = ['due_at', 'created_at', 'updated_at', 'ordered_at'];
    public $appends = ['full_name', 'estimated_delivery_date', 'is_overdue', 'is_overdue_likely', 'status', 'has_thumb', 'thumb_url'];
    public $fillable = ['event_id', 'requester_id', 'agent_id', 'name', 'notes', 'is_purchase', 'purchase_order', 'estimate_sent_at', 'delivered_at', 'production_days', 'is_template', 'is_notable', 'approved_at', 'due_at', 'closed_at'];
    private $send_assignment_notification = true;
    private $create_setup_task = true;
    private $create_estimate_task = true;
    private $rebuild_owners_timeline = false;

    public function event() {
        return $this->belongsTo(Event::class);
    }

    public function requester() {
        return $this->belongsTo(Requester::class, 'requester_id');
    }

    public function agent() {
        return $this->belongsTo(Agent::class, 'agent_id');
    }

    public function tasks() {
        return $this->hasMany(Task::class);
    }

    public function incomplete_tasks() {
        return $this->hasMany(Task::class)->whereNull('completed_at');
    }

    public function assignees() {
        return $this->hasManyThrough(Agent::class, Task::class, 'agent_id', 'bar', 'jack');
    }

    public function timeline_tasks() {
        return $this->hasMany(TimelineTask::class);
    }

    public function comments() {
        return $this->hasMany(Comment::class);
    }

    public function files() {
        return $this->hasManyThrough(File::class, Comment::class);
    }

    public function recipients() {
        return $this->belongsToMany(User::class, 'project_recipients', 'project_id', 'user_id');
    }

    public function scopePending($query) {
        $query->where('is_backlog', '=', false)
            ->whereNull('closed_at')
            ->whereDoesntHave('tasks', function ($tasks_query) {
                $tasks_query->whereNull('completed_at');
            });
    }

    public function getStatusAttribute() {

        if ($this->closed_at) {
            return [
                'name'       => 'Closed',
                'short_name' => 'Closed',
                'color'      => '#adadad',
                'text_color' => '#fff'
            ];
        }
        if ($this->ordered_at) {
            return [
                'name'       => 'Ordered (ETA ' . $this->ordered_at->addDays($this->production_days)->format('n/j') . ')',
                'short_name' => 'ordered',
                'color'      => '#129af8',
                'text_color' => '#fff'
            ];
        }
        if ($this->on_hold_until && $this->on_hold_until->isFuture()) {
            return [
                'name'       => 'On Hold Until ' . $this->on_hold_until->diffForHumans(),
                'short_name' => 'On Hold',
                'color'      => '#f8d512',
                'text_color' => '#fff'
            ];
        }
        if ($this->approved_at) {
            return [
                'name'       => 'Approved',
                'short_name' => 'Approved',
                'color'      => '#22f812',
                'text_color' => '#fff'
            ];
        }
        if ($this->is_backlog) {
            return [
                'name'       => 'Backlogged',
                'short_name' => 'Backlogged',
                'color'      => '#adadad',
                'text_color' => '#fff'
            ];
        }
        return [
            'name'       => 'Idle',
            'short_name' => 'Idle',
            'color'      => '#f85e12',
            'text_color' => '#fff'
        ];

    }

    public function getFullNameAttribute() {
        $event = $this->event;

        if (!$event) {
            return $this->name;
        }

        return $this->name . ' for ' . $this->event->name;
    }

    public function getEstimatedDeliveryDateAttribute() {
        $est = $this->getEstimatedDeliveryDate();

        return is_null($est) ? $est : $est->toDateString();
    }

    public function getIsOverdueLikelyAttribute() {
        $est = $this->getEstimatedDeliveryDate();
        $margin = 7;

// TODO: Want to take out margin now that we are padding the estimated completion date?
        return (!is_null($est) AND $est->gte($this->due_at->copy()->subDays($margin)));
    }

    public function getIsOverdueAttribute() {
        $est = $this->getEstimatedDeliveryDate();

        return (!is_null($est) AND $est->gte($this->due_at));
    }

    public function getThumbUrlAttribute() {
        return '/api/projects/' . $this->id . '/thumb.' . $this->getThumbExtension() . '?v=' . $this->getThumbFilename();
    }

    public function getHasThumbAttribute() {
        return !empty($this->thumb_file_name);
    }

    public function getThumbFilename() {
        if ($this->has_thumb) {
            $path_info = pathinfo($this->thumb_file_name);

            return $path_info['filename'];
        }

        return 'default';
    }

    public function getThumbExtension() {
        if ($this->has_thumb) {
            $path_info = pathinfo($this->thumb_file_name);

            return $path_info['extension'];
        }

        return 'jpg';
    }

    public function getThumbPath() {

        if ($this->has_thumb) {
            $path_info = pathinfo($this->thumb_file_name);

            return storage_path('project-thumbs/' . $this->id . '.' . $path_info['extension']);
        }

        // Can't use `public_path` because it points to `backend` directory in development
        return dirname($_SERVER['SCRIPT_FILENAME']) . DIRECTORY_SEPARATOR . 'build' . DIRECTORY_SEPARATOR . 'images' . DIRECTORY_SEPARATOR . 'default-square.jpg';
    }

    public function setThumbFileName($param) {
        $this->thumb_file_name = $param;

        return $this;
    }

    public function setEventId($param) {
        $this->{'event_id'} = $param;

        return $this;
    }

    public function setRequesterId($param) {
        $this->{'requester_id'} = $param;

        return $this;
    }

    public function getAgentId() {
        return $this->agent_id;
    }

    public function setAgentId($param) {
        $this->{'agent_id'} = $param;

        return $this;
    }

    public function getName() {
        return $this->{'name'};
    }

    public function setName($param) {
        $this->{'name'} = $param;

        return $this;
    }

    public function setDueAt($param) {
        $this->due_at = $param ? (new Carbon($param)) : null;

        return $this;
    }

    public function setOrderedAt($param) {
        $this->ordered_at = $param ? (new Carbon($param)) : null;

        return $this;
    }

    public function setEstimateSentAt($param) {
        $this->estimate_sent_at = $param ? (new Carbon($param)) : null;

        return $this;
    }

    public function getIsBacklog() {
        return $this->{'is_backlog'};
    }

    public function setIsBacklog($param) {
        $this->{'is_backlog'} = $param;

        return $this;
    }

    public function getIsPurchase() {
        return $this->{'is_purchase'};
    }

    public function setProductionDays($param) {
        return $this->{'production_days'} = $param;
    }

    public function shouldCreateSetupTask() {
        return $this->create_setup_task;
    }

    public function disableSetupTask() {
        $this->create_setup_task = false;

        return $this;
    }

    public function shouldCreateEstimateTask() {
        return $this->create_estimate_task;
    }

    public function disableEstimateTask() {
        $this->create_estimate_task = false;

        return $this;
    }

    public function disableDefaultTasks() {
        $this->disableSetupTask();
        $this->disableEstimateTask();

    }

    public function shouldSendAssignmentNotification() {
        return $this->send_assignment_notification;
    }

    public function disableAssignmentNotification() {
        $this->send_assignment_notification = false;

        return $this;
    }

    public function shouldRebuildOwnersTimeline($value = null) {
        if (!is_null($value)) {
            $this->rebuild_owners_timeline = $value;

            return $this;
        }

        return $this->rebuild_owners_timeline;
    }

    public function fillMore($data) {

        $this->fill($data);

        if (isset($data['event']['id'])) {
            $this->setEventId($data['event']['id']);
        }

        if (isset($data['requester']['id'])) {
            $this->setRequesterId($data['requester']['id']);
        }

        if (isset($data['agent']['id'])) {
            $this->setAgentId($data['agent']['id']);
        }

        return $this;

    }

    private function getEstimatedDeliveryDate() {

        $first_task_start = new Carbon($this->timeline_tasks()->min('timeline_date'));
        $last_task_start = new Carbon($this->timeline_tasks()->max('timeline_date'));

        $total_work_days = max(1, $first_task_start->diffInDays($last_task_start));
        $total_days = $total_work_days + $this->production_days;

        $padding = intval(ceil($total_days * .35));

        return $last_task_start->addDays($total_days + $padding);
    }

}
