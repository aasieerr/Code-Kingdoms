<?php

use Illuminate\Support\Facades\Route;

// Este proyecto es una API pura. Todas las rutas están en api.php.
// Esta ruta de salud básica puede ser útil para health-checks del contenedor.
Route::get('/', function () {
    return response()->json(['status' => 'ok']);
});
