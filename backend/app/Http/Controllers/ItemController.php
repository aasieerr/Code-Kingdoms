<?php

namespace App\Http\Controllers;

use App\Models\Character;
use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    /**
     * Obtener todos los items con sus detalles específicos
     * Acepta id_character para filtrar por el reino del personaje
     */
    public function index(Request $request)
    {
        $query = Item::with(['weapon', 'armor', 'consumable'])
            ->where('is_purchasable', true);

        if ($request->has('id_character')) {
            $character = Character::find($request->input('id_character'));
            if ($character) {
                $query->where(function ($q) use ($character) {
                    // Filtrar por reino
                    $q->where(function ($sub) use ($character) {
                        $sub->where('id_kingdom', $character->id_kingdom)
                            ->orWhereNull('id_kingdom');
                    });

                    // Filtrar por clase estricta
                    $q->where(function ($sub) use ($character) {
                        $sub->where('id_class', $character->id_class)
                            ->orWhereNull('id_class'); // Para consumibles o equipo común
                    });
                });
            }
        }

        // Filtrar por shop_type (si la tienda fue abierta por un NPC con shop_type)
        if ($request->has('shop_type')) {
            $shopType = $request->input('shop_type');
            if ($shopType === 'gear') {
                $query->whereIn('type', ['weapon', 'armor']);
            } elseif ($shopType === 'consumables') {
                $query->where('type', 'consumable');
            }
        }

        $items = $query->get();

        // Agregar detalles específicos a cada item
        $items->transform(function ($item) {
            $details = null;
            switch ($item->type) {
                case 'weapon':
                    $details = $item->weapon;
                    break;
                case 'armor':
                    $details = $item->armor;
                    break;
                case 'consumable':
                    $details = $item->consumable;
                    break;
            }
            $item->details = $details;
            return $item;
        });

        return $items;
    }
}
