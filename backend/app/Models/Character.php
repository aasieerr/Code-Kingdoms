<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    protected static function booted()
    {
        static::saving(function ($character) {
            if ($character->isDirty('level')) {
                $oldLevel = $character->getOriginal('level') ?? 1;
                $newLevel = $character->level;

                if ($newLevel > $oldLevel) {
                    $levelsGained = $newLevel - $oldLevel;
                    $character->stat_points += ($levelsGained * 3);
                }
            }
        });
    }

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
        'max_health',
        'max_mana',
        'attack_power',
        'speed',
        'stat_points',
        'gold',
        'arena_section',
        'arena_wave',
        'arena_in_progress',
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

    public function items()
    {
        return $this->belongsToMany(Item::class, 'character_items', 'id_character', 'id_item')
            ->withPivot('quantity', 'is_equipped')
            ->withTimestamps();
    }

    public function equippedItems()
    {
        return $this->items()->wherePivot('is_equipped', true);
    }

    /**
     * Calcula la experiencia necesaria para el siguiente nivel
     */
    public function getExperienceForLevel($level)
    {
        return $level * 100; // Ejemplo: Nivel 1 -> 100 EXP, Nivel 2 -> 200 EXP...
    }

    /**
     * Añade experiencia y gestiona la subida de nivel
     */
    public function addExperience($amount)
    {
        $this->experience += $amount;
        
        while ($this->experience >= $this->getExperienceForLevel($this->level)) {
            $this->experience -= $this->getExperienceForLevel($this->level);
            $this->level++;
            $this->stat_points += 3; // Nerf: 3 puntos por cada nivel subido
        }

        return $this->save();
    }

    /**
     * Sube un atributo gastando puntos de estadística
     */
    public function upgradeStat(string $stat)
    {
        if ($this->stat_points <= 0) {
            return false;
        }

        switch ($stat) {
            case 'health':
                $this->max_health += 20;
                $this->health = $this->max_health; // Curar al subir vida
                break;
            case 'attack':
                $this->attack_power += 5;
                break;
            case 'speed':
                if ($this->speed < 200) {
                    $this->speed = min(200, $this->speed + 2);
                } else {
                    return false;
                }
                break;
            default:
                return false;
        }

        $this->stat_points -= 1;
        return $this->save();
    }
}
