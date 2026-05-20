<?php

namespace Database\Seeders;

use App\Models\Kingdom;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KingdomSeeder extends Seeder
{
    public function run(): void
    {
        Kingdom::query()->firstOrCreate(
            ['name' => 'Peachepe'],
            Kingdom::factory()->peachepe()->raw() + [
                'id_king' => null,
            ],
        );
        Kingdom::query()->firstOrCreate(
            ['name' => 'Java'],
            Kingdom::factory()->java()->raw() + [
                'id_king' => null,
            ],
        );
    }
}
