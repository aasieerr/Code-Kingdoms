<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiamos los posts destacados antiguos si los hubiera
        CommunityPost::query()->where('is_featured', true)->delete();

        // El seeder ahora está vacío para que la comunidad empiece limpia 
        // y solo contenga posts reales de los usuarios.
    }
}
