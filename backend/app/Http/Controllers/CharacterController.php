<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\User;
use App\Models\CharacterClass;
use App\Models\Item;
use App\Models\CharacterItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class CharacterController extends Controller
{
    private function authorizeOwnership(Character $character): void
    {
        if ((int) $character->id_user !== (int) Auth::id()) {
            abort(403, 'Este personaje no te pertenece.');
        }
    }

    public function index()
    {
        $userId = (int) Auth::id();
        $characters = Character::query()
            ->where('id_user', $userId)
            ->with(['kingdom', 'race', 'characterClass', 'equippedSkin'])
            ->orderBy('id')
            ->get();

        $ownedSkinIds = User::query()
            ->findOrFail($userId)
            ->ownedSkins()
            ->pluck('cosmetic_skins.id')
            ->values()
            ->all();

        $payload = $characters->map(static function (Character $character) use ($ownedSkinIds) {
            return array_merge($character->toArray(), [
                'owned_skin_ids' => $ownedSkinIds,
            ]);
        });

        return response()->json($payload);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'id_kingdom' => 'required|exists:kingdoms,id_kingdom',
            'id_race' => 'required|exists:races,id_race',
            'id_class' => 'required|exists:character_classes,id_class',
            'name' => ['required', 'string', 'max:50', Rule::unique('characters', 'name')->where(fn ($q) => $q->where('id_user', Auth::id()))],
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

        $this->assignStartingEquipment($character);

        return response()->json($character, 201);
    }

    private function assignStartingEquipment(Character $character)
    {
        $charClass = CharacterClass::find($character->id_class);
        if (!$charClass)
            return;

        $weaponName = match ($charClass->name) {
            'Guerrero' => 'Espada de Entrenamiento',
            'Mago' => 'Varita de Madera',
            'Arquero' => 'Arco de Iniciado',
            'Paladín' => 'Hacha de Piedra',
            'Asesino' => 'Daga de Práctica',
            default => 'Espada de Entrenamiento',
        };

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

    public function show(string $id)
    {
        $character = Character::query()
            ->with(['equippedSkin', 'equippedItems.weapon', 'equippedItems.armor', 'characterClass'])
            ->findOrFail($id);

        $this->authorizeOwnership($character);

        $user = User::query()->findOrFail($character->id_user);
        $ownedIds = $user->ownedSkins()->pluck('cosmetic_skins.id')->values();

        return response()->json(array_merge($character->toArray(), [
            'code_coins' => $user->code_coins,
            'owned_skin_ids' => $ownedIds->all(),
        ]));
    }

    public function update(Request $request, string $id)
    {
        $character = Character::findOrFail($id);
        $this->authorizeOwnership($character);

        $request->validate([
            'id_kingdom' => 'sometimes|exists:kingdoms,id_kingdom',
            'id_race' => 'sometimes|exists:races,id_race',
            'id_class' => 'sometimes|exists:character_classes,id_class',
            'name' => ['sometimes', 'string', 'max:50', Rule::unique('characters', 'name')->where(fn ($q) => $q->where('id_user', Auth::id()))->ignore($id, 'id')],
            'level' => 'sometimes|integer|min:1',
            'experience' => 'sometimes|integer|min:0',
            'health' => 'sometimes|integer|min:0',
            'mana' => 'sometimes|integer|min:0',
            'max_health' => 'sometimes|integer|min:0',
            'max_mana' => 'sometimes|integer|min:0',
            'attack_power' => 'sometimes|integer|min:0',
            'speed' => 'sometimes|integer|min:0',
            'stat_points' => 'sometimes|integer|min:0',
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

    public function destroy(string $id)
    {
        $character = Character::findOrFail($id);
        $this->authorizeOwnership($character);
        $character->delete();

        return response()->json(['message' => 'Character deleted']);
    }

    public function upgradeStat(Request $request, string $id)
    {
        $character = Character::findOrFail($id);
        $this->authorizeOwnership($character);

        $request->validate([
            'stat' => 'required|string|in:health,attack,speed'
        ]);

        if ($character->upgradeStat($request->input('stat'))) {
            return response()->json([
                'success' => true,
                'character' => $character
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'No tienes puntos suficientes o atributo inválido'
        ], 400);
    }
}
