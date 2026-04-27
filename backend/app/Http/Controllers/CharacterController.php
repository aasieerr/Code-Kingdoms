<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CharacterController extends Controller
{
    /**
     * Listado de personajes del usuario autenticado.
     */
    public function index()
    {
        $characters = Character::query()
            ->where('id_user', (int) Auth::id())
            ->with(['kingdom', 'race', 'characterClass'])
            ->orderBy('id')
            ->get();

        return response()->json($characters);
    }

    /**
     * Crea un personaje para el usuario autenticado (Sanctum).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kingdom' => 'required|exists:kingdoms,id',
            'id_race' => 'required|exists:races,id',
            'id_class' => 'required|exists:character_classes,id',
            'name' => 'required|string|max:50',
            'level' => 'sometimes|integer|min:1',
            'experience' => 'sometimes|integer|min:0',
            'health' => 'sometimes|integer|min:0',
            'mana' => 'sometimes|integer|min:0',
            'gold' => 'sometimes|integer|min:0',
        ]);

        $validated['id_user'] = (int) $request->user()->id;
        $payload = array_merge(
            [
                'level' => 1,
                'experience' => 0,
                'health' => 100,
                'mana' => 50,
                'gold' => 0,
            ],
            $validated
        );
        $character = Character::create($payload);

        return response()->json($character, 201);
    }

    /**
     * Muestra un personaje; solo el propietario o datos públicos acordes.
     */
    public function show(string $id)
    {
        $character = Character::query()
            ->with(['equippedSkin'])
            ->findOrFail($id);

        if ((int) $character->id_user !== (int) Auth::id()) {
            abort(403, 'No puedes ver este personaje');
        }

        $user = User::query()->findOrFail($character->id_user);
        $ownedIds = $user->ownedSkins()->pluck('cosmetic_skins.id');

        return response()->json(array_merge($character->toArray(), [
            'code_coins' => $user->code_coins,
            'owned_skin_ids' => $ownedIds,
        ]));
    }

    public function update(Request $request, string $id)
    {
        $character = Character::findOrFail($id);
        if ((int) $character->id_user !== (int) Auth::id()) {
            abort(403, 'No puedes modificar este personaje');
        }

        $request->validate([
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
        $data = $request->all();
        unset($data['id_user']);
        $character->update($data);

        return response()->json($character);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $character = Character::findOrFail($id);
        if ((int) $character->id_user !== (int) Auth::id()) {
            abort(403, 'No puedes eliminar este personaje');
        }
        $character->delete();

        return response()->json(['message' => 'Character deleted']);
    }
}
