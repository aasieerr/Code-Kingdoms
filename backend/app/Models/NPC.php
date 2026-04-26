<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NPC extends Model
{
    protected $table = 'npcs';

    protected $fillable = [
        'nombre',
        'descripcion',
        'dialogos',
        'tipo',
        'map',
        'x',
        'y',
    ];

    protected $casts = [
        'dialogos' => 'array',
    ];

    /**
     * Scope a query to only include NPCs of a given map.
     */
    public function scopeOfMap($query, string $map)
    {
        return $query->where('map', $map);
    }
}
