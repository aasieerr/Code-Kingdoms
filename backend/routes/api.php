<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KingdomController;
use App\Http\Controllers\RaceController;
use App\Http\Controllers\CharacterClassController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NPCController;
use App\Http\Controllers\CharacterController;
use App\Http\Controllers\CharacterItemController;
use App\Http\Controllers\ShopController;
use App\Http\Controllers\CosmeticSkinController;

// Rutas públicas
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

// Tienda de ítems con oro (NPCs; TODO: auth)
Route::post('/shop/purchase', [ShopController::class, 'purchase']);

// Skins / CodeCoins (micropagos; TODO: auth)
Route::get('/skins', [CosmeticSkinController::class, 'index']);
Route::post('/skins/purchase', [CosmeticSkinController::class, 'purchase']);
Route::post('/characters/{id}/equip-skin', [CosmeticSkinController::class, 'equip']);

// GET /api/character-items (público mientras Keycloak está deshabilitado en el front)
// TODO: mover de vuelta al grupo protegido cuando se active la autenticación
Route::get('/character-items', [CharacterItemController::class, 'index']);
Route::get('/character-items/{id}', [CharacterItemController::class, 'show']);
Route::post('/character-items', [CharacterItemController::class, 'store']); // Agregado PÚBLICO para probar el Equipar desde 0
Route::put('/character-items/{id}', [CharacterItemController::class, 'update']); // Agregado PÚBLICO para probar el Equipar sin token

// GET /api/characters (público mientras Keycloak está deshabilitado en el front)
Route::get('/characters', [CharacterController::class, 'index']);
Route::get('/characters/{id}', [CharacterController::class, 'show']);

// Rutas protegidas con Keycloak (escritura)
Route::middleware('auth:api')->group(function () {
    // Characters — escritura
    Route::post('/characters', [CharacterController::class, 'store']);
    Route::put('/characters/{id}', [CharacterController::class, 'update']);
    Route::patch('/characters/{id}', [CharacterController::class, 'update']);
    Route::delete('/characters/{id}', [CharacterController::class, 'destroy']);
    
    // Character-items — escritura (temporalmente movido store y update a público)
    Route::patch('/character-items/{id}', [CharacterItemController::class, 'update']);
    Route::delete('/character-items/{id}', [CharacterItemController::class, 'destroy']);
});