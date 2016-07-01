<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Project
 * @package App\Models
 *
 * @property string full_name;
 *
 */
class Project extends Model {

    protected $dates = ['due_at', 'created_at', 'updated_at'];
    public $appends = ['full_name', 'order_by', 'estimated_delivery_date', 'is_overdue', 'is_overdue_likely'];
    public $fillable = ['event_id', 'requester_id', 'agent_id', 'name', 'notes', 'status', 'is_purchase', 'purchase_order', 'estimate_sent_at', 'delivered_at', 'production_days', 'is_template', 'is_notable', 'approved_at', 'due_at'];

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

    public function getFullNameAttribute() {
        $event = $this->event;

        if (!$event) {
            return $this->getOriginal('name');
        }

        return $this->getOriginal('name') . ' for ' . $this->event->name;
    }

    public function getEstimatedDeliveryDateAttribute() {
        $est = $this->getEstimatedDeliveryDate();

        return is_null($est) ? $est : $est->toDateString();
    }

    public function getIsOverdueLikelyAttribute() {
        $est = $this->getEstimatedDeliveryDate();
        $margin = 7;

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

    public function setAgentId($param) {
        $this->{'agent_id'} = $param;

        return $this;
    }

    public function getIsPurchase() {
        return $this->is_purchase;
    }

    public function setProductionDays($param) {
        return $this->production_days = $param;
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
        $est = $this->timeline_tasks()->max('timeline_date');

        if (is_null($est)) {
            return Carbon::today();
        }

        $est = new Carbon($est);
        $add_days = (int)$this->production_days;

        return $est->addDays($add_days);
    }

}
