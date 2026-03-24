<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    /** @use HasFactory<\Database\Factories\SkillFactory> */
    use HasFactory;

    protected $primaryKey = 'id_skill';
    protected $table = 'skills';

    protected $fillable = [
        'id_class',
        'name',
        'mana_cost',
        'power',
    ];

    /**
     * Relación con CharacterClass
     */
    public function characterClass()
    {
        return $this->belongsTo(CharacterClass::class, 'id_class', 'id_class');
    }
}
