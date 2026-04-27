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
        $classes = [
            'Guerrero' => ['description' => 'Un combatiente robusto experto en armas de melé.', 'allowed_weapons' => json_encode(['espada', 'hacha']), 'allowed_armors' => json_encode(['armadura_pesada'])],
            'Mago'     => ['description' => 'Un erudito de las artes arcanas con gran poder mágico.', 'allowed_weapons' => json_encode(['varita', 'baston']), 'allowed_armors' => json_encode(['armadura_ligera'])],
            'Arquero'  => ['description' => 'Un experto en ataques a distancia y agilidad.', 'allowed_weapons' => json_encode(['arco', 'ballesta']), 'allowed_armors' => json_encode(['armadura_media'])],
            'Paladín'  => ['description' => 'Un guerrero sagrado que protege a sus aliados.', 'allowed_weapons' => json_encode(['espada', 'maza']), 'allowed_armors' => json_encode(['armadura_pesada', 'escudo'])],
            'Asesino'  => ['description' => 'Un maestro del sigilo y los ataques rápidos.', 'allowed_weapons' => json_encode(['daga', 'espada_corta']), 'allowed_armors' => json_encode(['armadura_ligera'])],
        ];

        foreach ($classes as $name => $data) {
            CharacterClass::updateOrCreate(['name' => $name], $data);
        }
    }
}
