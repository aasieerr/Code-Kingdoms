<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CharacterItem;
use App\Models\Item;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShopController extends Controller
{
    /**
     * Compra un artículo del catálogo: descuenta oro en servidor y añade o incrementa el ítem.
     * La lógica de negocio vive aquí (no en el front) para evitar manipular oro vía consola.
     */
    public function purchase(Request $request): JsonResponse
    {
        $data = $request->validate([
            'id_character' => 'required|integer|exists:characters,id',
            'id_item' => 'required|integer|exists:items,id_item',
            'quantity' => 'sometimes|integer|min:1|max:99',
        ]);

        $quantity = (int) ($data['quantity'] ?? 1);

        $result = DB::transaction(function () use ($data, $quantity) {
            $character = Character::lockForUpdate()->findOrFail($data['id_character']);
            $item = Item::findOrFail($data['id_item']);

            $lineTotal = $item->price * $quantity;
            if ($lineTotal <= 0) {
                throw ValidationException::withMessages([
                    'id_item' => 'Este artículo no está a la venta o tiene precio 0.',
                ]);
            }

            if ($character->gold < $lineTotal) {
                throw ValidationException::withMessages([
                    'gold' => sprintf(
                        'Oro insuficiente. Necesitas %d y tienes %d.',
                        $lineTotal,
                        $character->gold
                    ),
                ]);
            }

            $character->gold -= $lineTotal;
            $character->save();

            $existing = CharacterItem::query()
                ->where('id_character', $character->id)
                ->where('id_item', $item->id_item)
                ->first();

            if ($existing) {
                $existing->quantity = ($existing->quantity ?? 1) + $quantity;
                $existing->save();
                $characterItem = $existing;
            } else {
                $characterItem = CharacterItem::create([
                    'id_character' => $character->id,
                    'id_item' => $item->id_item,
                    'quantity' => $quantity,
                    'is_equipped' => false,
                ]);
            }

            $characterItem->load(['item.weapon', 'item.armor', 'item.consumable']);

            if ($characterItem->item) {
                $characterItem->item->details = match ($characterItem->item->type) {
                    'weapon' => $characterItem->item->weapon,
                    'armor' => $characterItem->item->armor,
                    'consumable' => $characterItem->item->consumable,
                    default => null,
                };
            }

            return [
                'character' => $character->fresh(),
                'character_item' => $characterItem,
                'spent' => $lineTotal,
            ];
        });

        return response()->json($result, 201);
    }
}
