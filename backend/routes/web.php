<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KingdomController;
use App\Http\Controllers\KingController;
use App\Http\Controllers\RaceController;
use App\Http\Controllers\CharacterClassController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NPCController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CharacterItemController;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/kingdoms', [KingdomController::class, 'index']);
Route::get('/kingdoms/{id}', [KingdomController::class, 'show']);
Route::get('/kings', [KingController::class, 'index']);
Route::get('/kings/{id}', [KingController::class, 'show']);
Route::get('/races', [RaceController::class, 'index']);
Route::get('/races/{id}', [RaceController::class, 'show']);
Route::get('/classes', [CharacterClassController::class, 'index']);
Route::get('/classes/{id}', [CharacterClassController::class, 'show']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/{id}', [SkillController::class, 'show']);
Route::get('/classes/{classId}/skills', [SkillController::class, 'getByClass']);
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{id}', [ItemController::class, 'show']);
Route::get('/items/type/{type}', [ItemController::class, 'getByType']);
Route::get('/npcs', [NPCController::class, 'index']);
Route::get('/npcs/{id}', [NPCController::class, 'show']);
Route::resource('characters', CharacterController::class);
Route::resource('character-items', CharacterItemController::class);
