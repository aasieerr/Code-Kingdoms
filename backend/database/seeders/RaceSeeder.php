<?php

namespace Database\Seeders;

use App\Models\Race;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RaceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Race::factory()->human()->create();
        Race::factory()->elf()->create();
        Race::factory()->dwarf()->create();
        Race::factory()->orc()->create();
    }
}
