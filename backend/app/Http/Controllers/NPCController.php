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
            ->when($request->map, fn($q) => $q->ofMap($request->map));

        // Si se pasa id_character, filtrar NPCs por reino del personaje (o globales)
        if ($request->has('id_character')) {
            $character = \App\Models\Character::find($request->input('id_character'));
            if ($character) {
                $npcs->where(function ($q) use ($character) {
                    $q->where('id_kingdom', $character->id_kingdom)
                      ->orWhereNull('id_kingdom');
                });
            }
        }

        $npcs = $npcs->get();

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
