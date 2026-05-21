<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use Illuminate\Database\Seeder;

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
