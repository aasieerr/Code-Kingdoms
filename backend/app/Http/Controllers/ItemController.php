<?php

namespace App\Http\Controllers;

use App\Models\Item;
use Illuminate\Http\Request;

class ItemController extends Controller
{
    /**
     * Obtener todos los items con sus detalles específicos
     */
    public function index()
    {
        $items = Item::with(['weapon', 'armor', 'consumable'])->get();

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

    /**
     * Obtener un item específico con sus detalles
     */
    public function show($id)
    {
        $item = Item::with(['weapon', 'armor', 'consumable'])->find($id);

        if (!$item) {
            return response()->json(['message' => 'Item no encontrado'], 404);
        }

        // Agregar detalles específicos
        switch ($item->type) {
            case 'weapon':
                $item->details = $item->weapon;
                break;
            case 'armor':
                $item->details = $item->armor;
                break;
            case 'consumable':
                $item->details = $item->consumable;
                break;
        }

        return $item;
    }

    /**
     * Obtener items por tipo
     */
    public function getByType($type)
    {
        if (!in_array($type, ['weapon', 'armor', 'consumable'])) {
            return response()->json(['message' => 'Tipo de item inválido'], 400);
        }

        $items = Item::where('type', $type)->with([$type])->get();

        $items->transform(function ($item) use ($type) {
            $item->details = $item->$type;
            return $item;
        });

        return $items;
    }
}
