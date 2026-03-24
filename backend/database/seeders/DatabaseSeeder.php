<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $this->call(KingdomSeeder::class);
        $this->call(KingSeeder::class);
        $this->call(RaceSeeder::class);
        $this->call(CharacterClassSeeder::class);
        $this->call(SkillSeeder::class);
        $this->call(ItemSeeder::class);
        $this->call(NPCSeeder::class);
        $this->call(CharacterSeeder::class);
        $this->call(CharacterItemSeeder::class);
    }
}
