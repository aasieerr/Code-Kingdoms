<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    protected $fillable = [
        'id_user',
        'id_kingdom',
        'id_race',
        'id_class',
        'name',
        'level',
        'experience',
        'health',
        'mana',
        'gold',
        'equipped_skin_id',
        'sprite_data',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'id_user');
    }

    public function equippedSkin(): BelongsTo
    {
        return $this->belongsTo(CosmeticSkin::class, 'equipped_skin_id');
    }

    public function kingdom(): BelongsTo
    {
        return $this->belongsTo(Kingdom::class, 'id_kingdom');
    }

    public function race(): BelongsTo
    {
        return $this->belongsTo(Race::class, 'id_race');
    }

    public function characterClass(): BelongsTo
    {
        return $this->belongsTo(CharacterClass::class, 'id_class');
    }
}
