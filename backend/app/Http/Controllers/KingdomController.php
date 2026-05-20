<?php

namespace App\Http\Controllers;

use App\Models\Kingdom;

class KingdomController extends Controller
{
    public function index()
    {
        return Kingdom::all();
    }

    public function show($id)
    {
        $kingdom = Kingdom::find($id);

        if (!$kingdom) {
            return response()->json(['message' => 'Reino no encontrado'], 404);
        }

        return $kingdom;
    }
}
