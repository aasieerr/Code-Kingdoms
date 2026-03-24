<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NPC;

class NPCController extends Controller
{
    public function index()
    {
        return response()->json(NPC::all());
    }

    public function show($id)
    {
        return response()->json(NPC::findOrFail($id));
    }
}
