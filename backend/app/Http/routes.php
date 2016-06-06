<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the controller to call when that URI is requested.
|
*/

use Illuminate\Support\Facades\Route;

Route::get('api/authenticate', 'AuthenticateController@index');
Route::post('api/authenticate', 'AuthenticateController@authenticate');

Route::group(['prefix' => 'api', 'middleware' => 'jwt.auth'], function () {

    // Projects
    Route::get('projects/{id}', 'ProjectsController@show');
    Route::post('projects', 'ProjectsController@store');
    Route::put('projects/{id}', 'ProjectsController@update');

    // Tasks
    Route::get('tasks', 'TasksController@index');
    Route::post('tasks', 'TasksController@store');
    Route::get('tasks/{id}', 'TasksController@show');

    // Agents
    Route::get('agents', 'AgentsController@index');

    // Timeline
    Route::get('timeline', 'TimelineController@index');

});

Route::get('{path?}', ['uses' => 'MainController@index'])->where('path', '.+');
