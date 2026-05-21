<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CosmeticSkin extends Model
{
    protected $table = 'cosmetic_skins';

    protected $fillable = [
        'name',
        'slug',
        'color_still',
        'color_moving',
        'price_code_coins',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_skin', 'skin_id', 'user_id')
            ->withTimestamps();
    }
}
