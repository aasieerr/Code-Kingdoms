<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CosmeticSkin;
use App\Models\User;
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
     * Compra con CodeCoins; el aspecto queda en la cuenta (user_skin), no ligado a un personaje.
     * Cualquier personaje del mismo usuario puede equiparlo después.
     */
    public function purchase(Request $request): JsonResponse
    {
        $data = $request->validate([
            'skin_id' => 'required|integer|exists:cosmetic_skins,id',
        ]);

        $result = DB::transaction(function () use ($data, $request) {
            $user = User::lockForUpdate()->findOrFail((int) $request->user()->id);
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
     * Equipa un skin en este personaje si la cuenta (user) ya lo compró.
     * Cualquier personaje del mismo usuario puede equipar la misma skin.
     */
    public function equip(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'skin_id' => ['present', 'nullable', 'integer', 'exists:cosmetic_skins,id'],
        ]);

        $character = Character::with('user')->findOrFail($id);

        if ((int) $character->id_user !== (int) $request->user()->id) {
            abort(403, 'No puedes modificar este personaje');
        }

        $user = $character->user;

        if ($data['skin_id'] === null) {
            $character->equipped_skin_id = null;
            $character->save();
            $character->load('equippedSkin');

            return response()->json($character);
        }

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
