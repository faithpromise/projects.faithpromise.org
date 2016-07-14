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

Route::get('zendesk-import', 'MainController@zendeskImport');
Route::get('api/authenticate', 'AuthenticateController@index');
Route::post('api/authenticate', 'AuthenticateController@authenticate');

Route::group(['prefix' => 'api', 'middleware' => 'jwt.auth'], function () {

    // Projects
    Route::get('projects/', 'ProjectsController@index');
    Route::get('projects/{id}', 'ProjectsController@show');
    Route::post('projects', 'ProjectsController@store');
    Route::put('projects/{id}', 'ProjectsController@update');
    Route::put('projects/{id}/recipients', 'ProjectsController@updateRecipients');

    // Tasks
    Route::get('tasks', 'TasksController@index');
    Route::post('tasks', 'TasksController@store');
    Route::put('tasks/{id}', 'TasksController@update');
    Route::get('tasks/{id}', 'TasksController@show');
    Route::delete('tasks/{id}', 'TasksController@destroy');

    // Users
    Route::get('users', 'UsersController@index');
    Route::get('users/{id}', 'UsersController@show');

    // Agents
    Route::get('agents', 'AgentsController@index');
    Route::get('agents/{id}', 'AgentsController@show');

    // Timeline
    Route::get('timeline', 'TimelineController@index');

    // Comments
    Route::get('comments', 'CommentsController@index');
    Route::post('comments', 'CommentsController@store');
    Route::put('comments/{id}', 'CommentsController@update');

    // Attachments
    Route::get('attachments', 'AttachmentsController@index');
    Route::post('attachments', 'AttachmentsController@store');
    Route::delete('attachments/{id}', 'AttachmentsController@destroy');

});

// Attachments
Route::get('api/attachments/{id}/file.{ext}', 'AttachmentsController@download');
Route::get('api/attachments/{id}/thumb.{ext}', 'AttachmentsController@thumb');

// Process inbound email
Route::any('postmark-inbound', 'CommentsController@inbound');

Route::get('{path?}', ['uses' => 'MainController@index'])->where('path', '.+');
