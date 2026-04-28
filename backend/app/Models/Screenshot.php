<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Screenshot extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'character_name',
        'image_path',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
