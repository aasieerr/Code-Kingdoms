<?php

namespace App\Http\Controllers;

use App\Models\King;
use Illuminate\Http\Request;

class KingController extends Controller
{
    /**
     * Obtener todos los reyes
     */
    public function index()
    {
        return King::all();
    }

    /**
     * Obtener un rey por ID
     */
    public function show($id)
    {
        $king = King::find($id);
        
        if (!$king) {
            return response()->json(['message' => 'Rey no encontrado'], 404);
        }
        
        return $king;
    }
}
