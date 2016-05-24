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

Route::get('/api/projects/{id}', 'ProjectsController@show');
Route::get('/api/timeline', 'TimelineController@index');

Route::get('{path?}', ['uses' => 'MainController@index'])->where('path', '.+');
