<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class King extends Model
{
    /** @use HasFactory<\Database\Factories\KingFactory> */
    use HasFactory;

    protected $primaryKey = 'id_king';
    protected $table = 'kings';
    
    protected $fillable = [
        'name',
        'description',
        'id_kingdom',
    ];
}
