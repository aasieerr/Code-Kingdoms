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
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        \Illuminate\Support\Facades\DB::table('npcs')->truncate();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        \App\Models\NPC::create([
            'nombre' => 'Guardián del Reino',
            'descripcion' => 'Un sabio guardián que protege el reino.',
            'dialogos' => [
                '¡Bienvenido, aventurero! ¿Qué te trae por estas tierras?',
                'El reino necesita héroes como tú.',
                'Cuídate en tu viaje.'
            ],
            'tipo' => 'normal',
            'map' => 'MainGame',
            'x' => 950,
            'y' => 900,
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
            'map' => 'MainGame',
            'x' => 380,
            'y' => 1240,
        ]);

        \App\Models\NPC::create([
            'nombre' => 'Bibliotecario Real',
            'descripcion' => 'Conoce toda la historia del código.',
            'dialogos' => [
                'Los antiguos escribieron el mundo en binario.',
                'Busca los fragmentos de la compilación perdida.',
                'El conocimiento es la mejor arma.'
            ],
            'tipo' => 'normal',
            'map' => 'MainGame',
            'x' => 1250,
            'y' => 700,
        ]);

        \App\Models\NPC::create([
            'nombre' => 'Herrero de las Ruinas',
            'descripcion' => 'Forja armas legendarias.',
            'dialogos' => [
                'El acero se templa con paciencia.',
                '¿Has traído materiales raros?',
                'Vuelve cuando tengas suficiente oro.'
            ],
            'tipo' => 'vendedor',
            'map' => 'MainGame',
            'x' => 1350,
            'y' => 1500,
        ]);
    }
}
