<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CharacterItem extends Model
{
    protected $fillable = [
        'id_character',
        'id_item',
        'quantity',
        'is_equipped',
    ];

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class, 'id_character');
    }

    public function item(): BelongsTo
    {
        // FK local: id_item → Item.id_item (clave primaria custom)
        return $this->belongsTo(Item::class, 'id_item', 'id_item');
    }
}
