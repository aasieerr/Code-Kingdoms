<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CharacterClass extends Model
{
    /** @use HasFactory<\Database\Factories\CharacterClassFactory> */
    use HasFactory;

    protected $primaryKey = 'id_class';
    protected $table = 'character_classes';

    protected $fillable = [
        'name',
        'description',
        'allowed_weapons',
        'allowed_armors',
        'starting_skills',
    ];

    protected $casts = [
        'allowed_weapons' => 'array',
        'allowed_armors' => 'array',
        'starting_skills' => 'array',
    ];
}
