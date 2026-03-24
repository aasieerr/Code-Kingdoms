<?php

namespace App\Http\Controllers;

use App\Models\CharacterClass;
use Illuminate\Http\Request;

class CharacterClassController extends Controller
{
    /**
     * Obtener todas las clases de personaje
     */
    public function index()
    {
        return CharacterClass::all();
    }

    /**
     * Obtener una clase de personaje por ID
     */
    public function show($id)
    {
        $characterClass = CharacterClass::find($id);

        if (!$characterClass) {
            return response()->json(['message' => 'Clase no encontrada'], 404);
        }

        return $characterClass;
    }
}
