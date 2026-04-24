<?php

namespace Database\Seeders;

use App\Models\Character;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CharacterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        Character::query()->updateOrCreate(
            ['id_user' => $user->id, 'name' => 'Héroe de Peachepe'],
            [
                'id_kingdom' => 1,
                'id_race' => 1,
                'id_class' => 1,
                'level' => 1,
                'experience' => 0,
                'health' => 100,
                'mana' => 50,
                'gold' => 100,
            ],
        );

        Character::query()->updateOrCreate(
            ['id_user' => $user->id, 'name' => 'Mago de Java'],
            [
                'id_kingdom' => 2,
                'id_race' => 2,
                'id_class' => 2,
                'level' => 1,
                'experience' => 0,
                'health' => 80,
                'mana' => 100,
                'gold' => 50,
            ],
        );
    }
}
