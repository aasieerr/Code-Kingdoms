<?php

namespace Database\Seeders;

use App\Models\CharacterClass;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CharacterClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        CharacterClass::factory()->warrior()->create();
        CharacterClass::factory()->mage()->create();
        CharacterClass::factory()->archer()->create();
        CharacterClass::factory()->paladin()->create();
        CharacterClass::factory()->assassin()->create();
    }
}
