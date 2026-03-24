<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kingdom extends Model
{
    /** @use HasFactory<\Database\Factories\KingdomFactory> */
    use HasFactory;

    protected $primaryKey = 'id_kingdom';
    protected $table = 'kingdoms';
    
    protected $fillable = [
        'name',
        'description',
        'realm',
        'id_king',
    ];
}
