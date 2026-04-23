<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CharacterItem;

class CharacterItemController extends Controller
{
    /**
     * Display a listing of the resource.
     * Acepta ?id_character=X para filtrar por personaje.
     * Cada entrada incluye el item con sus detalles específicos.
     */
    public function index(Request $request)
    {
        $query = CharacterItem::with(['item.weapon', 'item.armor', 'item.consumable']);

        if ($request->has('id_character')) {
            $query->where('id_character', $request->input('id_character'));
        }

        $characterItems = $query->get();

        $characterItems->transform(function ($ci) {
            if ($ci->item) {
                $ci->item->details = match ($ci->item->type) {
                    'weapon' => $ci->item->weapon,
                    'armor' => $ci->item->armor,
                    'consumable' => $ci->item->consumable,
                    default => null,
                };
            }
            return $ci;
        });

        return response()->json($characterItems);
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
