<?php

namespace Database\Seeders;

use App\Models\Armor;
use App\Models\Consumable;
use App\Models\Item;
use App\Models\Weapon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Crear armas
        $this->createWeapons();

        // Crear armaduras
        $this->createArmors();

        // Crear consumibles
        $this->createConsumables();
    }

    private function createWeapons()
    {
        $weapons = [
            [
                'name' => 'Espada del Guerrero',
                'description' => 'Espada legendaria forjada por los antiguos herreros.',
                'damage' => 35,
                'weapon_type' => 'espada',
                'durability' => 100,
            ],
            [
                'name' => 'Varita Arcana',
                'description' => 'Varita imbuida con energía mágica pura.',
                'damage' => 25,
                'weapon_type' => 'varita',
                'durability' => 80,
            ],
            [
                'name' => 'Arco de Roble',
                'description' => 'Arco preciso tallado en madera de roble antiguo.',
                'damage' => 30,
                'weapon_type' => 'arco',
                'durability' => 90,
            ],
            [
                'name' => 'Hacha de Batalla',
                'description' => 'Hacha poderosa usada por guerreros bárbaros.',
                'damage' => 40,
                'weapon_type' => 'hacha',
                'durability' => 95,
            ],
            [
                'name' => 'Daga Asesina',
                'description' => 'Daga ligera ideal para ataques furtivos.',
                'damage' => 20,
                'weapon_type' => 'daga',
                'durability' => 70,
            ],
        ];

        foreach ($weapons as $weaponData) {
            $item = Item::create([
                'name' => $weaponData['name'],
                'description' => $weaponData['description'],
                'type' => 'weapon',
            ]);

            Weapon::create([
                'id_item' => $item->id_item,
                'damage' => $weaponData['damage'],
                'weapon_type' => $weaponData['weapon_type'],
                'durability' => $weaponData['durability'],
            ]);
        }
    }

    private function createArmors()
    {
        $armors = [
            [
                'name' => 'Armadura de Placas',
                'description' => 'Armadura completa que protege contra ataques físicos.',
                'defense' => 25,
                'armor_type' => 'armadura_pesada',
                'durability' => 100,
            ],
            [
                'name' => 'Túnica Mágica',
                'description' => 'Túnica tejida con hilos encantados.',
                'defense' => 12,
                'armor_type' => 'armadura_ligera',
                'durability' => 75,
            ],
            [
                'name' => 'Escudo de Acero',
                'description' => 'Escudo reforzado con acero templado.',
                'defense' => 18,
                'armor_type' => 'escudo',
                'durability' => 90,
            ],
            [
                'name' => 'Armadura de Cuero',
                'description' => 'Armadura ligera pero resistente.',
                'defense' => 15,
                'armor_type' => 'armadura_media',
                'durability' => 85,
            ],
        ];

        foreach ($armors as $armorData) {
            $item = Item::create([
                'name' => $armorData['name'],
                'description' => $armorData['description'],
                'type' => 'armor',
            ]);

            Armor::create([
                'id_item' => $item->id_item,
                'defense' => $armorData['defense'],
                'armor_type' => $armorData['armor_type'],
                'durability' => $armorData['durability'],
            ]);
        }
    }

    private function createConsumables()
    {
        $consumables = [
            [
                'name' => 'Poción de Curación',
                'description' => 'Restaura puntos de vida al instante.',
                'effect' => 'heal',
                'power' => 75,
                'duration' => null,
                'quantity' => 3,
            ],
            [
                'name' => 'Poción de Maná',
                'description' => 'Recupera energía mágica rápidamente.',
                'effect' => 'mana_restore',
                'power' => 60,
                'duration' => null,
                'quantity' => 2,
            ],
            [
                'name' => 'Elixir de Fuerza',
                'description' => 'Aumenta la fuerza temporalmente.',
                'effect' => 'buff_strength',
                'power' => 10,
                'duration' => 5,
                'quantity' => 1,
            ],
            [
                'name' => 'Antídoto',
                'description' => 'Cura efectos de veneno y enfermedades.',
                'effect' => 'cure_poison',
                'power' => 100,
                'duration' => null,
                'quantity' => 2,
            ],
            [
                'name' => 'Elixir de Vida',
                'description' => 'Elixir legendario que revive a los caídos.',
                'effect' => 'revive',
                'power' => 50,
                'duration' => null,
                'quantity' => 1,
            ],
        ];

        foreach ($consumables as $consumableData) {
            $item = Item::create([
                'name' => $consumableData['name'],
                'description' => $consumableData['description'],
                'type' => 'consumable',
            ]);

            Consumable::create([
                'id_item' => $item->id_item,
                'effect' => $consumableData['effect'],
                'power' => $consumableData['power'],
                'duration' => $consumableData['duration'],
                'quantity' => $consumableData['quantity'],
            ]);
        }
    }
}
