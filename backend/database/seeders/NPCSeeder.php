<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class NPCSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\NPC::create([
            'nombre' => 'Guardián del Reino',
            'descripcion' => 'Un sabio guardián que protege el reino.',
            'dialogos' => [
                '¡Bienvenido, aventurero! ¿Qué te trae por estas tierras?',
                'El reino necesita héroes como tú.',
                'Cuídate en tu viaje.'
            ],
            'tipo' => 'normal',
        ]);

        \App\Models\NPC::create([
            'nombre' => 'Mercader Astuto',
            'descripcion' => 'Un vendedor de armas y armaduras.',
            'dialogos' => [
                '¡Hola! ¿Buscas equipo nuevo?',
                'Tengo las mejores armas del reino.',
                'Regatea conmigo, pero no demasiado.'
            ],
            'tipo' => 'vendedor',
        ]);
    }
}
