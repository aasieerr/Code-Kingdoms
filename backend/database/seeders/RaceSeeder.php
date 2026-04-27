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
        $races = [
            'Humano' => ['strength_bonus' => 5, 'agility_bonus' => 5, 'intelligence_bonus' => 5, 'vitality_bonus' => 5, 'luck_bonus' => 5],
            'Elfo'   => ['strength_bonus' => 2, 'agility_bonus' => 8, 'intelligence_bonus' => 8, 'vitality_bonus' => 3, 'luck_bonus' => 4],
            'Enano'  => ['strength_bonus' => 8, 'agility_bonus' => 2, 'intelligence_bonus' => 4, 'vitality_bonus' => 8, 'luck_bonus' => 3],
            'Orco'   => ['strength_bonus' => 10, 'agility_bonus' => 3, 'intelligence_bonus' => 2, 'vitality_bonus' => 9, 'luck_bonus' => 1],
        ];

        foreach ($races as $name => $stats) {
            Race::updateOrCreate(['name' => $name], $stats);
        }
    }
}
