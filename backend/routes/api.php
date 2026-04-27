<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CharacterClassController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CharacterItemController;
use App\Http\Controllers\CosmeticSkinController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\KingdomController;
use App\Http\Controllers\NPCController;
use App\Http\Controllers\RaceController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\SkillController;
use Illuminate\Support\Facades\Route;

// Rutas públicas (contenido del juego / registro)
Route::get('/kingdoms', [KingdomController::class, 'index']);
Route::get('/kingdoms/{id}', [KingdomController::class, 'show']);
Route::get('/races', [RaceController::class, 'index']);
Route::get('/races/{id}', [RaceController::class, 'show']);
Route::get('/classes', [CharacterClassController::class, 'index']);
Route::get('/classes/{id}', [CharacterClassController::class, 'show']);
Route::get('/skills', [SkillController::class, 'index']);
Route::get('/skills/{id}', [SkillController::class, 'show']);
Route::get('/items', [ItemController::class, 'index']);
Route::get('/items/{id}', [ItemController::class, 'show']);
Route::get('/npcs', [NPCController::class, 'index']);
Route::get('/npcs/{id}', [NPCController::class, 'show']);

Route::get('/skins', [CosmeticSkinController::class, 'index']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/character-items', [CharacterItemController::class, 'index']);
Route::get('/character-items/{id}', [CharacterItemController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/character-items', [CharacterItemController::class, 'store']);
    Route::put('/character-items/{id}', [CharacterItemController::class, 'update']);
    Route::patch('/character-items/{id}', [CharacterItemController::class, 'update']);
    Route::post('/shop/purchase', [ShopController::class, 'purchase']);
    Route::post('/skins/purchase', [CosmeticSkinController::class, 'purchase']);
    Route::post('/characters/{id}/equip-skin', [CosmeticSkinController::class, 'equip']);

    Route::get('/characters', [CharacterController::class, 'index']);
    Route::get('/characters/{id}', [CharacterController::class, 'show']);
    Route::post('/characters', [CharacterController::class, 'store']);
    Route::put('/characters/{id}', [CharacterController::class, 'update']);
    Route::patch('/characters/{id}', [CharacterController::class, 'update']);
    Route::delete('/characters/{id}', [CharacterController::class, 'destroy']);
    Route::delete('/character-items/{id}', [CharacterItemController::class, 'destroy']);
});
