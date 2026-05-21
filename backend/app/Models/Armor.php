<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Armor extends Model
{
    /** @use HasFactory<\Database\Factories\ArmorFactory> */
    use HasFactory;

    protected $primaryKey = 'id_item';
    public $incrementing = false;
    protected $keyType = 'unsignedBigInteger';
    protected $table = 'armors';

    protected $fillable = [
        'id_item',
        'defense',
        'armor_type',
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
