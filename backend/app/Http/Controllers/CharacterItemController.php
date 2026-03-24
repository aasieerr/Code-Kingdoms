<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CharacterItem;

class CharacterItemController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(CharacterItem::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_character' => 'required|exists:characters,id',
            'id_item' => 'required|exists:items,id_item',
            'quantity' => 'integer|min:1',
            'is_equipped' => 'boolean',
        ]);

        $characterItem = CharacterItem::create($request->all());
        return response()->json($characterItem, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return response()->json(CharacterItem::findOrFail($id));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $characterItem = CharacterItem::findOrFail($id);

        $request->validate([
            'id_character' => 'sometimes|exists:characters,id',
            'id_item' => 'sometimes|exists:items,id_item',
            'quantity' => 'sometimes|integer|min:1',
            'is_equipped' => 'sometimes|boolean',
        ]);

        $characterItem->update($request->all());
        return response()->json($characterItem);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $characterItem = CharacterItem::findOrFail($id);
        $characterItem->delete();
        return response()->json(['message' => 'Character item deleted']);
    }
}
