<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\User;
use App\Models\CharacterClass;
use App\Models\Item;
use App\Models\CharacterItem;
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
            'id_kingdom' => 'required|exists:kingdoms,id_kingdom',
            'id_race' => 'required|exists:races,id_race',
            'id_class' => 'required|exists:character_classes,id_class',
            'name' => 'required|string|max:50|unique:characters,name',
            'level' => 'sometimes|integer|min:1',
            'experience' => 'sometimes|integer|min:0',
            'health' => 'sometimes|integer|min:0',
            'mana' => 'sometimes|integer|min:0',
            'gold' => 'sometimes|integer|min:0',
            'sprite_data' => 'sometimes|string',
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

        // Asignar equipo inicial según la clase
        $this->assignStartingEquipment($character);

        return response()->json($character, 201);
    }

    /**
     * Asigna un arma y armadura inicial al personaje recién creado según su clase.
     */
    private function assignStartingEquipment(Character $character)
    {
        $charClass = CharacterClass::find($character->id_class);
        if (!$charClass)
            return;

        // Selección de arma
        $weaponName = match ($charClass->name) {
            'Guerrero' => 'Espada de Entrenamiento',
            'Mago' => 'Varita de Madera',
            'Arquero' => 'Arco de Iniciado',
            'Paladín' => 'Hacha de Piedra',
            'Asesino' => 'Daga de Práctica',
            default => 'Espada de Entrenamiento',
        };

        // Selección de armadura
        $armorName = match ($charClass->name) {
            'Mago', 'Asesino' => 'Ropas de Viajero',
            'Arquero', 'Guerrero' => 'Peto de Cuero Viejo',
            'Paladín' => 'Escudo de Madera Circular',
            default => 'Ropas de Viajero',
        };

        $this->giveAndEquipItem($character->id, $weaponName);
        $this->giveAndEquipItem($character->id, $armorName);
    }

    private function giveAndEquipItem($characterId, $itemName)
    {
        $item = Item::where('name', $itemName)->first();
        if ($item) {
            CharacterItem::updateOrCreate(
                ['id_character' => $characterId, 'id_item' => $item->id_item],
                ['quantity' => 1, 'is_equipped' => true]
            );
        }
    }

    /**
     * Muestra un personaje; solo el propietario o datos públicos acordes.
     */
    public function show(string $id)
    {
        $character = Character::query()
            ->with(['equippedSkin', 'equippedItems.weapon', 'equippedItems.armor'])
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
            'id_kingdom' => 'sometimes|exists:kingdoms,id_kingdom',
            'id_race' => 'sometimes|exists:races,id_race',
            'id_class' => 'sometimes|exists:character_classes,id_class',
            'name' => 'sometimes|string|max:50|unique:characters,name,' . $id,
            'level' => 'sometimes|integer|min:1',
            'experience' => 'sometimes|integer|min:0',
            'health' => 'sometimes|integer|min:0',
            'mana' => 'sometimes|integer|min:0',
            'gold' => 'sometimes|integer|min:0',
            'arena_section' => 'sometimes|integer|min:1|max:8',
            'arena_wave' => 'sometimes|integer|min:1|max:20',
            'arena_in_progress' => 'sometimes|boolean',
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
