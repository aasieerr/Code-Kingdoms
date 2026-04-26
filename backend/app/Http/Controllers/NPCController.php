<?php

namespace App\Http\Controllers;

use App\Models\NPC;
use Illuminate\Http\Request;

class NPCController extends Controller
{
    /**
     * Display a listing of NPCs, optionally filtered by map.
     */
    public function index(Request $request)
    {
        $npcs = NPC::query()
            ->when($request->map, fn($q) => $q->ofMap($request->map))
            ->get();

        return response()->json($npcs);
    }

    /**
     * Display the specified NPC.
     */
    public function show($id)
    {
        return response()->json(NPC::findOrFail($id));
    }
}
