<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CosmeticSkin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CosmeticSkinController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(CosmeticSkin::query()->orderBy('id')->get());
    }

    /**
     * Compra con CodeCoins; el skin queda vinculado a la cuenta (user), no al personaje.
     */
    public function purchase(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_character' => 'required|integer|exists:characters,id',
            'skin_id' => 'required|integer|exists:cosmetic_skins,id',
        ]);

        $result = DB::transaction(function () use ($data) {
            $character = Character::lockForUpdate()->with('user')->findOrFail($data['id_character']);
            $user = $character->user;
            $skin = CosmeticSkin::findOrFail($data['skin_id']);

            if ($user->ownedSkins()->whereKey($skin->id)->exists()) {
                throw ValidationException::withMessages([
                    'skin_id' => 'Ya posees este aspecto.',
                ]);
            }

            if ($user->code_coins < $skin->price_code_coins) {
                throw ValidationException::withMessages([
                    'code_coins' => sprintf(
                        'Necesitas %d CodeCoins. Tienes %d.',
                        $skin->price_code_coins,
                        $user->code_coins
                    ),
                ]);
            }

            $user->code_coins -= $skin->price_code_coins;
            $user->save();
            $user->ownedSkins()->syncWithoutDetaching([$skin->id]);

            return [
                'user' => $user->fresh(),
                'skin' => $skin,
                'spent' => $skin->price_code_coins,
            ];
        });

        return response()->json($result, 201);
    }

    /**
     * Equipa un skin previamente comprado (misma regla: usuario dueño del personaje).
     */
    public function equip(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'skin_id' => 'required|integer|exists:cosmetic_skins,id',
        ]);

        $character = Character::with('user')->findOrFail($id);
        $user = $character->user;
        $skinId = (int) $data['skin_id'];

        if (! $user->ownedSkins()->whereKey($skinId)->exists()) {
            return response()->json(['message' => 'No has comprado este aspecto.'], 422);
        }

        $character->equipped_skin_id = $skinId;
        $character->save();
        $character->load('equippedSkin');

        return response()->json($character);
    }
}
