<?php

namespace App\Http\Controllers;

use App\Models\CharacterClass;

class CharacterClassController extends Controller
{
    /**
     * Obtener todas las clases de personaje
     */
    public function index()
    {
        return CharacterClass::all();
    }
}
