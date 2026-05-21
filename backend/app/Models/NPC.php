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
        'shop_type',
        'x',
        'y',
    ];

    protected $casts = [
        'dialogos' => 'array',
    ];

    public function kingdom()
    {
        return $this->belongsTo(Kingdom::class, 'id_kingdom', 'id_kingdom');
    }

    public function scopeOfMap($query, string $map)
    {
        return $query->where('map', $map);
    }
}
