<?php

namespace Database\Seeders;

use App\Models\King;
use App\Models\Kingdom;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $peachepe = Kingdom::where('realm', 'Peachepe')->first();
        $java = Kingdom::where('realm', 'Java')->first();
        
        $kingPeachepe = King::factory()->peachepe()->create([
            'description' => 'El gran rey del reino Peachepe, gobernante sabio y justo.',
            'id_kingdom' => $peachepe->id_kingdom,
        ]);
        
        $kingJava = King::factory()->java()->create([
            'description' => 'El poderoso rey del reino Java, guerrero legendario.',
            'id_kingdom' => $java->id_kingdom,
        ]);
        
        // Actualizar reinos con sus reyes
        $peachepe->update(['id_king' => $kingPeachepe->id_king]);
        $java->update(['id_king' => $kingJava->id_king]);
    }
}
