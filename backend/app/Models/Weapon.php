<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Weapon extends Model
{
    /** @use HasFactory<\Database\Factories\WeaponFactory> */
    use HasFactory;

    protected $primaryKey = 'id_item';
    public $incrementing = false;
    protected $keyType = 'unsignedBigInteger';
    protected $table = 'weapons';

    protected $fillable = [
        'id_item',
        'damage',
        'weapon_type',
        'durability',
    ];

    /**
     * Relación con Item
     */
    public function item()
    {
        return $this->belongsTo(Item::class, 'id_item', 'id_item');
    }
}
