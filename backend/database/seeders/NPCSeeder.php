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

        // Assign existing NPCs to PHP kingdom (Peachepe)
        $php = \App\Models\Kingdom::where('name', 'Peachepe')->first();

        if ($php) {
            \App\Models\NPC::create([
                'nombre' => 'Guardián del Reino',
                'descripcion' => 'Un sabio guardián que protege el reino.',
                'dialogos' => [
                    'Bienvenido a Peachepe, desarrollador. ¿Necesitas ayuda con Composer o rutas?',
                    'En este reino usamos Composer, Artisan y buen gusto.',
                    'Recuerda: documenta tu código como si fuera la última vez.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 660,
                'y' => 600,
            ]);

            \App\Models\NPC::create([
                'nombre' => 'Mercader Astuto',
                'descripcion' => 'Un vendedor de paquetes y herramientas.',
                'dialogos' => [
                    '¿Buscas paquetes? Prueba Composer, siempre hay actualizaciones.',
                    'Tengo paquetes para Laravel, Symfony y hasta por si acaso dd() te salva.',
                    'Recuerda vaciar la cache después del deploy.'
                ],
                'tipo' => 'vendedor',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 180,
                'y' => 740,
            ]);

            \App\Models\NPC::create([
                'nombre' => 'Bibliotecario Real',
                'descripcion' => 'Conoce toda la historia del código.',
                'dialogos' => [
                    'Los archivos de configuración guardan secretos útiles para despliegues.',
                    '¿Has leído la documentación de PHP sobre tipos y rendimiento?',
                    'La comunidad PHP tiene grandes recursos: usa Pest y tests.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 900,
                'y' => 300,
            ]);

            \App\Models\NPC::create([
                'nombre' => 'Herrero de las Ruinas',
                'descripcion' => 'Forja scripts y soluciones.',
                'dialogos' => [
                    'El servidor se tempera con buenos procesos: usa PHP-FPM y supervisores.',
                    'Trae materiales: logs, trazas y un buen php.ini.',
                    'Vuelve cuando quieras optimizar tus scripts.'
                ],
                'tipo' => 'vendedor',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 760,
                'y' => 430,
            ]);
        }

        // Create Java-specific NPCs in the Java kingdom
        $java = \App\Models\Kingdom::where('name', 'Java')->first();

        if ($java) {
            \App\Models\NPC::create([
                'nombre' => 'Maestro del Bytecode',
                'descripcion' => 'Un anciano que habla en bytecode y JARs.',
                'dialogos' => [
                    'Compila primero, pregunta después. ¡Y no olvides el classpath!',
                    'La JVM cuida de la memoria, pero no de tus referencias.',
                    '¿Has probado con un GC tuning? Puede salvar tus servidores.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                'x' => 400,
                'y' => 500,
            ]);

            \App\Models\NPC::create([
                'nombre' => 'Mercader de Maven',
                'descripcion' => 'Vende dependencias y plugins.',
                'dialogos' => [
                    'Necesitas una dependencia? Puedo buscarla en el repositorio central.',
                    'Un buen pom.xml vale más que mil líneas duplicadas.',
                    'Si tus builds fallan, prueba limpiar el target.'
                ],
                'tipo' => 'vendedor',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                'x' => 1200,
                'y' => 620,
            ]);

            \App\Models\NPC::create([
                'nombre' => 'Sabio de la JVM',
                'descripcion' => 'Experto en hilos y rendimiento.',
                'dialogos' => [
                    'La concurrencia bien manejada es una canción para servidores robustos.',
                    'Sincroniza con cuidado: los locks rompen más que arreglan.',
                    'Recuerda usar JMH si quieres medir con precisión.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                'x' => 980,
                'y' => 220,
            ]);
        }
    }
}
