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

    protected $dates = ['due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name', 'order_by', 'estimated_delivery_date', 'is_overdue', 'is_overdue_likely', 'status'];
    public $fillable = ['event_id', 'requester_id', 'agent_id', 'name', 'notes', 'is_purchase', 'purchase_order', 'estimate_sent_at', 'delivered_at', 'production_days', 'is_template', 'is_notable', 'approved_at', 'due_at'];
    private $send_assignment_notification = true;
    private $create_setup_task = true;
    private $create_estimate_task = true;

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

    public function getStatusAttribute() {
        if ($this->closed_at) {
            return 'closed';
        }
        if ($this->ordered_at) {
            return 'ordered';
        }
        if ($this->approved_at) {
            return 'approved';
        }
        if ($this->is_backlog) {
            return 'backlogged';
        }
        return 'open';
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

    public function getOrderByAttribute() {
        $sub_days = (int)$this->production_days;

// TODO: Return null if no production
        return $this->due_at->subDays($sub_days)->toDateString();
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
        $this->due_at = $this->due_at ? (new Carbon($param)) : null;

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
