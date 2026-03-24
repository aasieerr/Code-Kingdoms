<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\Character::create([
            'id_user' => 1, // Asumiendo que el user test existe
            'id_kingdom' => 1,
            'id_race' => 1,
            'id_class' => 1,
            'name' => 'Héroe de Peachepe',
            'level' => 1,
            'experience' => 0,
            'health' => 100,
            'mana' => 50,
            'gold' => 100,
        ]);

        \App\Models\Character::create([
            'id_user' => 1,
            'id_kingdom' => 2,
            'id_race' => 2,
            'id_class' => 2,
            'name' => 'Mago de Java',
            'level' => 1,
            'experience' => 0,
            'health' => 80,
            'mana' => 100,
            'gold' => 50,
        ]);
    }
}
