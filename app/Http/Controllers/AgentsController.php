<?php

namespace App\Http\Controllers;

use App\Models\Agent;
use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\Auth;

class AgentsController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request) {

        $agents = Agent::query();
        $name = $request->input('name');

        if ($name) {
            $agents->where('first_name', 'like', $name . '%')->orWhere('last_name', 'like', $name . '%');
        }

        $user = Auth::user();

        if($user->email !== 'bradr@faithpromise.org' AND $user->email !== 'kyleg@faithpromise.org') {
            $agents->whereIn('email', ['bradr@faithpromise.org', 'kyleg@faithpromise.org', $user->email]);
        }

        return [
            'data' => $agents->get()
        ];
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create() {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request) {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id) {
        return [
            'data' => Agent::find($id)
        ];
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id) {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id) {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id) {
        //
    }
}
