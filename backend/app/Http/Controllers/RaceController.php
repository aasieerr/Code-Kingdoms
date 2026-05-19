<?php

namespace App\Http\Controllers;

use App\Models\Race;

class RaceController extends Controller
{
    /**
     * Obtener todas las razas
     */
    public function index()
    {
        return Race::all();
    }
}
