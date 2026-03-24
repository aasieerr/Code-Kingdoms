<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CharacterItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\CharacterItem::create([
            'id_character' => 1,
            'id_item' => 1,
            'quantity' => 1,
            'is_equipped' => true,
        ]);

        \App\Models\CharacterItem::create([
            'id_character' => 1,
            'id_item' => 2,
            'quantity' => 5,
            'is_equipped' => false,
        ]);

        \App\Models\CharacterItem::create([
            'id_character' => 2,
            'id_item' => 3,
            'quantity' => 2,
            'is_equipped' => false,
        ]);
    }
}
