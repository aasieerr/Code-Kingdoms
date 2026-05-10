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
            'Guerrero' => [
                'description' => 'Un combatiente robusto experto en armas de melé.', 
                'allowed_weapons' => ['espada', 'hacha', 'maza'], 
                'allowed_armors' => ['armadura_pesada', 'armadura_media', 'armadura_cabeza', 'armadura_pierna', 'escudo']
            ],
            'Mago' => [
                'description' => 'Un erudito de las artes arcanas con gran poder mágico.', 
                'allowed_weapons' => ['varita', 'baston'], 
                'allowed_armors' => ['armadura_ligera', 'armadura_cabeza', 'armadura_pierna']
            ],
            'Arquero' => [
                'description' => 'Un experto en ataques a distancia y agilidad.', 
                'allowed_weapons' => ['arco', 'ballesta'], 
                'allowed_armors' => ['armadura_media', 'armadura_ligera', 'armadura_cabeza', 'armadura_pierna']
            ],
            'Paladín' => [
                'description' => 'Un guerrero sagrado que protege a sus aliados.', 
                'allowed_weapons' => ['espada', 'maza'], 
                'allowed_armors' => ['armadura_pesada', 'escudo', 'armadura_cabeza', 'armadura_pierna']
            ],
            'Asesino' => [
                'description' => 'Un maestro del sigilo y los ataques rápidos.', 
                'allowed_weapons' => ['daga', 'espada'], 
                'allowed_armors' => ['armadura_ligera', 'armadura_media', 'armadura_cabeza', 'armadura_pierna']
            ],
        ];

        foreach ($classes as $name => $data) {
            CharacterClass::updateOrCreate(['name' => $name], [
                'description' => $data['description'],
                'allowed_weapons' => $data['allowed_weapons'], // Laravel cast handles JSON
                'allowed_armors' => $data['allowed_armors'],
            ]);
        }
    }
}
