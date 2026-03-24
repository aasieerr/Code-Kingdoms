<?php

namespace App\Http\Controllers;

use App\Models\Kingdom;
use Illuminate\Http\Request;

class KingdomController extends Controller
{
    /**
     * Obtener todos los reinos
     */
    public function index()
    {
        return Kingdom::all();
    }

    /**
     * Obtener un reino por ID
     */
    public function show($id)
    {
        $kingdom = Kingdom::find($id);
        
        if (!$kingdom) {
            return response()->json(['message' => 'Reino no encontrado'], 404);
        }
        
        return $kingdom;
    }
}
