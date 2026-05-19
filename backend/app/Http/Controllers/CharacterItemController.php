<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\CharacterItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

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
     * Gasta uno de un stack de consumibles (combate arena / uso autorizado desde cliente).
     * Ajusta vida/maná persistentes donde aplique y devuelve el efecto para el cliente.
     */
    public function consume(Request $request, string $id): JsonResponse
    {
        $data = $request->validate([
            'id_character' => 'required|integer|exists:characters,id',
            'arena_max_hp' => 'nullable|integer|min:1|max:500000',
            'arena_max_mana' => 'nullable|integer|min:1|max:500000',
        ]);

        $userId = (int) Auth::id();
        $character = Character::findOrFail($data['id_character']);
        if ((int) $character->id_user !== $userId) {
            abort(403, 'No puedes usar objetos para este personaje.');
        }

        $characterItem = CharacterItem::with(['item.consumable'])->findOrFail((int) $id);
        if ((int) $characterItem->id_character !== (int) $character->id) {
            abort(403, 'Este objeto no pertenece a este personaje.');
        }

        $item = $characterItem->item;
        if (!$item || $item->type !== 'consumable') {
            throw ValidationException::withMessages([
                'item' => 'Este objeto no es consumible.',
            ]);
        }

        $consumable = $item->consumable;
        if (!$consumable || (int) $characterItem->quantity < 1) {
            throw ValidationException::withMessages([
                'quantity' => 'No te queda cantidad de este consumible.',
            ]);
        }

        $effect = (string) $consumable->effect;
        $power = max(0, (int) $consumable->power);
        $hpCap = isset($data['arena_max_hp']) ? (int) $data['arena_max_hp'] : 99999;
        $manaCap = isset($data['arena_max_mana']) ? (int) $data['arena_max_mana'] : 99999;

        $hpCap = max(1, min(500000, $hpCap));
        $manaCap = max(1, min(500000, $manaCap));

        $remaining = null;

        DB::transaction(function () use ($character, $characterItem, $effect, $power, $hpCap, $manaCap, &$remaining) {
            /** @var Character $lockedChar */
            $lockedChar = Character::query()->lockForUpdate()->findOrFail($character->id);

            $freshRow = CharacterItem::query()->lockForUpdate()->findOrFail($characterItem->id);
            if ((int) $freshRow->quantity < 1) {
                throw ValidationException::withMessages([
                    'quantity' => 'No te queda cantidad de este consumible.',
                ]);
            }

            $newQty = (int) $freshRow->quantity - 1;
            if ($newQty < 1) {
                $freshRow->delete();
            } else {
                $freshRow->quantity = $newQty;
                $freshRow->save();
            }

            switch ($effect) {
                case 'heal':
                    $lockedChar->health = min($hpCap, max(0, (int) $lockedChar->health) + $power);
                    break;
                case 'mana_restore':
                    $lockedChar->mana = min($manaCap, max(0, (int) $lockedChar->mana) + $power);
                    break;
                case 'revive':
                    if ((int) $lockedChar->health < 1) {
                        $lockedChar->health = min($hpCap, max(1, $power));
                    } else {
                        $lockedChar->health = min($hpCap, max(0, (int) $lockedChar->health) + $power);
                    }
                    break;
                default:
                    break;
            }

            $lockedChar->save();

            if ($newQty >= 1) {
                $remaining = CharacterItem::with(['item.weapon', 'item.armor', 'item.consumable'])->find($freshRow->id);
                if ($remaining && $remaining->item) {
                    $remaining->item->details = match ($remaining->item->type) {
                        'weapon' => $remaining->item->weapon,
                        'armor' => $remaining->item->armor,
                        'consumable' => $remaining->item->consumable,
                        default => null,
                    };
                }
            }
        });

        return response()->json([
            'character_item' => $remaining,
            'effect' => $effect,
            'power' => $power,
            'duration' => $consumable->duration,
            'character' => $character->fresh(),
        ], 200);
    }
}
