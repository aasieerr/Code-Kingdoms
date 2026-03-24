<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Consumable extends Model
{
    /** @use HasFactory<\Database\Factories\ConsumableFactory> */
    use HasFactory;

    protected $primaryKey = 'id_item';
    public $incrementing = false;
    protected $keyType = 'unsignedBigInteger';
    protected $table = 'consumables';

    protected $fillable = [
        'id_item',
        'effect',
        'power',
        'duration',
        'quantity',
    ];

    /**
     * Relación con Item
     */
    public function item()
    {
        return $this->belongsTo(Item::class, 'id_item', 'id_item');
    }
}
