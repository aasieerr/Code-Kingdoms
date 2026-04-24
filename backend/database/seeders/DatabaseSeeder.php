<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Usuario demo: se puede volver a ejecutar db:seed sin duplicar el email
        User::query()->firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ],
        );

        $this->call(KingdomSeeder::class);
        $this->call(KingSeeder::class);
        $this->call(RaceSeeder::class);
        $this->call(CharacterClassSeeder::class);
        $this->call(SkillSeeder::class);
        $this->call(ItemSeeder::class);
        $this->call(NPCSeeder::class);
        $this->call(CosmeticSkinSeeder::class);
        $this->call(CharacterSeeder::class);
        $this->call(CharacterItemSeeder::class);
    }
}
