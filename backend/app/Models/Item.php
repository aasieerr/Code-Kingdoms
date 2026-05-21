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

    public function characterClass()
    {
        return $this->belongsTo(CharacterClass::class, 'id_class');
    }

    public function kingdom()
    {
        return $this->belongsTo(Kingdom::class, 'id_kingdom', 'id_kingdom');
    }

    public function weapon()
    {
        return $this->hasOne(Weapon::class, 'id_item', 'id_item');
    }

    public function armor()
    {
        return $this->hasOne(Armor::class, 'id_item', 'id_item');
    }

    public function consumable()
    {
        return $this->hasOne(Consumable::class, 'id_item', 'id_item');
    }
}
