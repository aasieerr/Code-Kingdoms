<?php

namespace Database\Seeders;

use App\Models\Kingdom;
use App\Models\NPC;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NPCSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('npcs')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Ensure the PHP kingdom exists (Peachepe)
        $php = Kingdom::query()->firstOrCreate(
            ['name' => 'Peachepe'],
            Kingdom::factory()->peachepe()->raw()
        );

        if ($php) {
            NPC::create([
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
                'x' => 810,
                'y' => 600,
            ]);

            NPC::create([
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
                // Mercader vende consumibles en PHP
                'shop_type' => 'consumables',
                'x' => 758,
                'y' => 272,
            ]);

            NPC::create([
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
                'x' => 704,
                'y' => 430,
            ]);

            NPC::create([
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
                // Herrero vende armas y armaduras en PHP
                'shop_type' => 'gear',
                'x' => 622,
                'y' => 536,
            ]);

            // NPCs adicionales para PHP
            NPC::create([
                'nombre' => 'Maestra de Blade',
                'descripcion' => 'Experta en plantillas y renderizado.',
                'dialogos' => [
                    'Las vistas limpias hacen aplicaciones felices.',
                    '¿Necesitas un componente? Te lo diseño con Blade.',
                    'Recuerda escapar las variables cuando muestres HTML.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 634,
                'y' => 688,
            ]);

            NPC::create([
                'nombre' => 'Guardia de Valet',
                'descripcion' => 'Protege las rutas del pueblo y vigila despliegues.',
                'dialogos' => [
                    'Mantén tu entorno local lo más parecido al de producción.',
                    'Los deploys sin pruebas siempre traen drama.',
                    'Si ves un error 500, revisa los logs primero.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'x' => 1004,
                'y' => 752,
            ]);

            // Mercader adicional para PHP (consumibles)
            NPC::create([
                'nombre' => 'Mercader del Bazar',
                'descripcion' => 'Un comerciante que siempre tiene algo para aliviar un mal rato.',
                'dialogos' => [
                    'Pociones frescas, antídotos y cafés fuertes: lo que necesites para el debug.',
                    'Tengo remedios para leaks de memoria y curitas para excepciones.',
                    'Compra ahora o vuelve cuando el servidor esté en llamas.'
                ],
                'tipo' => 'vendedor',
                'map' => 'MainGame',
                'id_kingdom' => $php->id_kingdom,
                'shop_type' => 'consumables',
                'x' => 966,
                'y' => 428,
            ]);
        }

        // Ensure the Java kingdom exists
        $java = Kingdom::query()->firstOrCreate(
            ['name' => 'Java'],
            Kingdom::factory()->java()->raw()
        );

        if ($java) {
            NPC::create([
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
                'x' => 1186,
                'y' => 880,
            ]);

            NPC::create([
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
                // Mercader vende consumibles en Java
                'shop_type' => 'consumables',
                'x' => 758,
                'y' => 272,
            ]);

            NPC::create([
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
                'shop_type' => null,
                'x' => 1186,
                'y' => 238,
            ]);

            // Herrero para Java (similar rol que en PHP pero nombre distinto)
            NPC::create([
                'nombre' => 'Forjador del JAR',
                'descripcion' => 'Forja artefactos y empaca dependencias.',
                'dialogos' => [
                    'Un buen JAR es fruto de pruebas y empaquetado correcto.',
                    'Cuida el classpath y evitarás NoClassDefFoundError.',
                    'Trae tus fuentes y te ayudo a generar el artefacto.'
                ],
                'tipo' => 'vendedor',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                // Herrero vende armas y armaduras en Java
                'shop_type' => 'gear',
                'x' => 484,
                'y' => 236,
            ]);

            // NPCs adicionales para Java
            NPC::create([
                'nombre' => 'Arquitecto de Microservicios',
                'descripcion' => 'Diseña sistemas desacoplados y escalables.',
                'dialogos' => [
                    'Divide los límites de servicio con responsabilidad.',
                    'Un buen contrato API evita discusiones en producción.',
                    'Recuerda: observabilidad > adivinación.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                'x' => 486,
                'y' => 882,
            ]);

            NPC::create([
                'nombre' => 'Guardia del ClassLoader',
                'descripcion' => 'Vigila las clases que habitan la JVM.',
                'dialogos' => [
                    'Cuidado con las dependencias transitivas: pueden traer sorpresas.',
                    'Si el ClassLoader falla, la aplicación no despierta.',
                    '¿Has probado aislar módulos con OSGi? No es para todos.'
                ],
                'tipo' => 'normal',
                'map' => 'MainGame',
                'id_kingdom' => $java->id_kingdom,
                'x' => 810,
                'y' => 600,
            ]);
        }
    }
}
