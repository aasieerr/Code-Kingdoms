<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Race extends Model
{
    /** @use HasFactory<\Database\Factories\RaceFactory> */
    use HasFactory;

    protected $primaryKey = 'id_race';
    protected $table = 'races';

    protected $fillable = [
        'name',
        'strength_bonus',
        'agility_bonus',
        'intelligence_bonus',
        'vitality_bonus',
        'luck_bonus',
    ];
}
