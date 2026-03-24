<?php

namespace Database\Seeders;

use App\Models\Kingdom;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KingdomSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Kingdom::factory()->peachepe()->create([
            'id_king' => null,
        ]);
        Kingdom::factory()->java()->create([
            'id_king' => null,
        ]);
    }
}
