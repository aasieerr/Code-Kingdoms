<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Character;
use App\Models\User;

class CharacterController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return response()->json(Character::all());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'id_user' => 'required|exists:users,id',
            'id_kingdom' => 'required|exists:kingdoms,id',
            'id_race' => 'required|exists:races,id',
            'id_class' => 'required|exists:character_classes,id',
            'name' => 'required|string|max:50',
            'level' => 'integer|min:1',
            'experience' => 'integer|min:0',
            'health' => 'integer|min:0',
            'mana' => 'integer|min:0',
            'gold' => 'integer|min:0',
        ]);

        $character = Character::create($request->all());
        return response()->json($character, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $character = Character::query()
            ->with(['equippedSkin'])
            ->findOrFail($id);

        $user = User::query()->findOrFail($character->id_user);
        $ownedIds = $user->ownedSkins()->pluck('cosmetic_skins.id');

        return response()->json(array_merge($character->toArray(), [
            'code_coins' => $user->code_coins,
            'owned_skin_ids' => $ownedIds,
        ]));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $character = Character::findOrFail($id);

        $request->validate([
            'id_user' => 'sometimes|exists:users,id',
            'id_kingdom' => 'sometimes|exists:kingdoms,id',
            'id_race' => 'sometimes|exists:races,id',
            'id_class' => 'sometimes|exists:character_classes,id',
            'name' => 'sometimes|string|max:50',
            'level' => 'sometimes|integer|min:1',
            'experience' => 'sometimes|integer|min:0',
            'health' => 'sometimes|integer|min:0',
            'mana' => 'sometimes|integer|min:0',
            'gold' => 'sometimes|integer|min:0',
        ]);

        $character->update($request->all());
        return response()->json($character);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $character = Character::findOrFail($id);
        $character->delete();
        return response()->json(['message' => 'Character deleted']);
    }
}
