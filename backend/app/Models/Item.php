<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    /** @use HasFactory<\Database\Factories\ItemFactory> */
    use HasFactory;

    protected $primaryKey = 'id_item';
    protected $table = 'items';

    protected $fillable = [
        'name',
        'description',
        'type',
        'price',
        'id_kingdom',
        'id_class',
        'is_purchasable',
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function characterClass()
    {
        return $this->belongsTo(CharacterClass::class, 'id_class');
    }

    /**
     * Relación con Kingdom (opcional)
     */
    public function kingdom()
    {
        return $this->belongsTo(Kingdom::class, 'id_kingdom', 'id_kingdom');
    }

    /**
     * Relación polimórfica con tipos específicos de items
     */
    public function itemable()
    {
        return $this->morphTo();
    }

    /**
     * Relación con Weapon
     */
    public function weapon()
    {
        return $this->hasOne(Weapon::class, 'id_item', 'id_item');
    }

    /**
     * Relación con Armor
     */
    public function armor()
    {
        return $this->hasOne(Armor::class, 'id_item', 'id_item');
    }

    /**
     * Relación con Consumable
     */
    public function consumable()
    {
        return $this->hasOne(Consumable::class, 'id_item', 'id_item');
    }
}
