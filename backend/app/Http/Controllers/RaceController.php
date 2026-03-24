<?php

namespace App\Http\Controllers;

use App\Models\Race;
use Illuminate\Http\Request;

class RaceController extends Controller
{
    /**
     * Obtener todas las razas
     */
    public function index()
    {
        return Race::all();
    }

    /**
     * Obtener una raza por ID
     */
    public function show($id)
    {
        $race = Race::find($id);

        if (!$race) {
            return response()->json(['message' => 'Raza no encontrada'], 404);
        }

        return $race;
    }
}
