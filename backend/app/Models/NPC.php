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
    ];

    protected $casts = [
        'dialogos' => 'array',
    ];
}
