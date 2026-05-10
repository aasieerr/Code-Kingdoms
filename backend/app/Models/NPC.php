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
        'id_kingdom',
        'map',
        'x',
        'y',
    ];

    protected $casts = [
        'dialogos' => 'array',
    ];

    /**
     * NPC belongs to a Kingdom (optional)
     */
    public function kingdom()
    {
        return $this->belongsTo(Kingdom::class, 'id_kingdom', 'id_kingdom');
    }

    /**
     * Scope a query to only include NPCs of a given map.
     */
    public function scopeOfMap($query, string $map)
    {
        return $query->where('map', $map);
    }
}
