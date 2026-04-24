<?php

namespace Database\Seeders;

use App\Models\Character;
use App\Models\CharacterItem;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CharacterItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::query()->where('email', 'test@example.com')->firstOrFail();
        $hero = Character::query()
            ->where('id_user', $user->id)
            ->where('name', 'Héroe de Peachepe')
            ->firstOrFail();
        $mage = Character::query()
            ->where('id_user', $user->id)
            ->where('name', 'Mago de Java')
            ->firstOrFail();

        CharacterItem::query()->updateOrCreate(
            ['id_character' => $hero->id, 'id_item' => 1],
            ['quantity' => 1, 'is_equipped' => true],
        );

        CharacterItem::query()->updateOrCreate(
            ['id_character' => $hero->id, 'id_item' => 2],
            ['quantity' => 5, 'is_equipped' => false],
        );

        CharacterItem::query()->updateOrCreate(
            ['id_character' => $mage->id, 'id_item' => 3],
            ['quantity' => 2, 'is_equipped' => false],
        );
    }
}
