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
        // Limpiar datos antiguos para evitar duplicados
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Weapon::query()->delete();
        Armor::query()->delete();
        Consumable::query()->delete();
        Item::query()->delete();
        \Illuminate\Support\Facades\DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // Obtener IDs de clases
        $idGuerrero = \App\Models\CharacterClass::where('name', 'Guerrero')->first()->id_class;
        $idMago = \App\Models\CharacterClass::where('name', 'Mago')->first()->id_class;
        $idArquero = \App\Models\CharacterClass::where('name', 'Arquero')->first()->id_class;
        $idPaladin = \App\Models\CharacterClass::where('name', 'Paladín')->first()->id_class;
        $idAsesino = \App\Models\CharacterClass::where('name', 'Asesino')->first()->id_class;

        $idPHP = 1;
        $idJava = 2;

        $weapons = [
            // --- BÁSICAS (No comprables, equipo inicial) ---
            ['name' => 'Espada de Entrenamiento', 'description' => 'Espada desafilada.', 'damage' => 15, 'weapon_type' => 'espada', 'durability' => 60, 'price' => 50, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idGuerrero],
            ['name' => 'Varita de Madera', 'description' => 'Rama de canalización.', 'damage' => 12, 'weapon_type' => 'varita', 'durability' => 50, 'price' => 45, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idMago],
            ['name' => 'Arco de Iniciado', 'description' => 'Arco simple.', 'damage' => 14, 'weapon_type' => 'arco', 'durability' => 55, 'price' => 48, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idArquero],
            ['name' => 'Hacha de Piedra', 'description' => 'Tosca hacha.', 'damage' => 18, 'weapon_type' => 'hacha', 'durability' => 65, 'price' => 55, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idGuerrero],
            ['name' => 'Hacha de Recluta', 'description' => 'Hacha para paladines novatos.', 'damage' => 17, 'weapon_type' => 'hacha', 'durability' => 60, 'price' => 52, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idPaladin],
            ['name' => 'Daga de Práctica', 'description' => 'Daga pequeña.', 'damage' => 10, 'weapon_type' => 'daga', 'durability' => 40, 'price' => 35, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idAsesino],

            // ======================== REINO JAVA (30 Armas) ========================
            
            // GUERRERO JAVA (6)
            ['name' => 'Espada de Acero Tipado', 'description' => 'Rígida y segura.', 'damage' => 32, 'weapon_type' => 'espada', 'durability' => 120, 'price' => 350, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Hacha Multi-Thread', 'description' => 'Múltiples hilos de dolor.', 'damage' => 45, 'weapon_type' => 'hacha', 'durability' => 150, 'price' => 650, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Mandoble Enterprise', 'description' => 'Arquitectura masiva.', 'damage' => 85, 'weapon_type' => 'espada', 'durability' => 300, 'price' => 1800, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Filo del GC', 'description' => 'Limpia la memoria enemiga.', 'damage' => 130, 'weapon_type' => 'espada', 'durability' => 450, 'price' => 4200, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Destripadora de Nulls', 'description' => 'Sin punteros nulos.', 'damage' => 200, 'weapon_type' => 'hacha', 'durability' => 800, 'price' => 12000, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Hacha de Abstracción', 'description' => 'Tan abstracta que ignora armaduras.', 'damage' => 250, 'weapon_type' => 'hacha', 'durability' => 1000, 'price' => 25000, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],

            // MAGO JAVA (6)
            ['name' => 'Cetro de Spring Boot', 'description' => 'Magia autoconfigurada.', 'damage' => 30, 'weapon_type' => 'varita', 'durability' => 90, 'price' => 400, 'id_kingdom' => $idJava, 'id_class' => $idMago],
            ['name' => 'Vara de Inyección', 'description' => 'Inyecta daño directo.', 'damage' => 70, 'weapon_type' => 'varita', 'durability' => 180, 'price' => 1500, 'id_kingdom' => $idJava, 'id_class' => $idMago],
            ['name' => 'Báculo de Maven', 'description' => 'Dependencias mágicas.', 'damage' => 55, 'weapon_type' => 'baston', 'durability' => 140, 'price' => 1100, 'id_kingdom' => $idJava, 'id_class' => $idMago],
            ['name' => 'Cetro del Oráculo', 'description' => 'Bytecode puro.', 'damage' => 150, 'weapon_type' => 'varita', 'durability' => 500, 'price' => 7500, 'id_kingdom' => $idJava, 'id_class' => $idMago],
            ['name' => 'Báculo de Jakarta EE', 'description' => 'Poder corporativo.', 'damage' => 180, 'weapon_type' => 'baston', 'durability' => 600, 'price' => 9800, 'id_kingdom' => $idJava, 'id_class' => $idMago],
            ['name' => 'Vara de Reflection', 'description' => 'Analiza y destruye al enemigo.', 'damage' => 240, 'weapon_type' => 'varita', 'durability' => 900, 'price' => 22000, 'id_kingdom' => $idJava, 'id_class' => $idMago],

            // ARQUERO JAVA (6)
            ['name' => 'Arco de la JVM', 'description' => 'Optimización JIT.', 'damage' => 40, 'weapon_type' => 'arco', 'durability' => 130, 'price' => 600, 'id_kingdom' => $idJava, 'id_class' => $idArquero],
            ['name' => 'Ballesta Hibernate', 'description' => 'Mapeo relacional de flechas.', 'damage' => 65, 'weapon_type' => 'ballesta', 'durability' => 170, 'price' => 1300, 'id_kingdom' => $idJava, 'id_class' => $idArquero],
            ['name' => 'Arco Microservicios', 'description' => 'Ráfagas desacopladas.', 'damage' => 120, 'weapon_type' => 'arco', 'durability' => 350, 'price' => 5200, 'id_kingdom' => $idJava, 'id_class' => $idArquero],
            ['name' => 'Arco de JavaFX', 'description' => 'Flechas con interfaz moderna.', 'damage' => 90, 'weapon_type' => 'arco', 'durability' => 280, 'price' => 3200, 'id_kingdom' => $idJava, 'id_class' => $idArquero],
            ['name' => 'Ballesta de Swing', 'description' => 'Clásica pero pesada.', 'damage' => 160, 'weapon_type' => 'ballesta', 'durability' => 500, 'price' => 8500, 'id_kingdom' => $idJava, 'id_class' => $idArquero],
            ['name' => 'Arco de Flecha Lambda', 'description' => 'Ejecución funcional.', 'damage' => 230, 'weapon_type' => 'arco', 'durability' => 800, 'price' => 18000, 'id_kingdom' => $idJava, 'id_class' => $idArquero],

            // PALADÍN JAVA (6)
            ['name' => 'Mazo de JUnit', 'description' => 'Tests de estrés.', 'damage' => 75, 'weapon_type' => 'maza', 'durability' => 200, 'price' => 1600, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Maza Inmutable', 'description' => 'Sin cambios de estado.', 'damage' => 110, 'weapon_type' => 'maza', 'durability' => 400, 'price' => 3500, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Martillo de Jenkins', 'description' => 'Integración continua de golpes.', 'damage' => 150, 'weapon_type' => 'maza', 'durability' => 600, 'price' => 7200, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Maza de Gradle', 'description' => 'Construye tu victoria.', 'damage' => 200, 'weapon_type' => 'maza', 'durability' => 800, 'price' => 13000, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Espada de BeanFactory', 'description' => 'Instancia el juicio sagrado.', 'damage' => 180, 'weapon_type' => 'espada', 'durability' => 550, 'price' => 10500, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Martillo de Kotlin', 'description' => 'Interoperabilidad divina.', 'damage' => 260, 'weapon_type' => 'maza', 'durability' => 1100, 'price' => 28000, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],

            // ASESINO JAVA (6)
            ['name' => 'Daga de Bytecode', 'description' => 'Nivel más bajo de dolor.', 'damage' => 35, 'weapon_type' => 'daga', 'durability' => 100, 'price' => 500, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],
            ['name' => 'Cuchillo de JIT', 'description' => 'Apuñala justo a tiempo.', 'damage' => 60, 'weapon_type' => 'daga', 'durability' => 150, 'price' => 1200, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],
            ['name' => 'Daga de Profiler', 'description' => 'Encuentra el cuello de botella.', 'damage' => 100, 'weapon_type' => 'daga', 'durability' => 250, 'price' => 4000, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],
            ['name' => 'Hoja de StackTrace', 'description' => 'Sigue el rastro de sangre.', 'damage' => 140, 'weapon_type' => 'daga', 'durability' => 400, 'price' => 7800, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],
            ['name' => 'Estilete de Debugger', 'description' => 'Pausa el corazón del enemigo.', 'damage' => 190, 'weapon_type' => 'daga', 'durability' => 600, 'price' => 14000, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],
            ['name' => 'Daga de HeapDump', 'description' => 'Colapsa la memoria enemiga.', 'damage' => 270, 'weapon_type' => 'daga', 'durability' => 950, 'price' => 32000, 'id_kingdom' => $idJava, 'id_class' => $idAsesino],

            // ======================== REINO PHP (30 Armas) ========================

            // GUERRERO PHP (6)
            ['name' => 'Cimitarra Eloquent', 'description' => 'Consultas al cuerpo rápidas.', 'damage' => 75, 'weapon_type' => 'espada', 'durability' => 220, 'price' => 1600, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],
            ['name' => 'Filo de Symfony', 'description' => 'Estructura robusta.', 'damage' => 115, 'weapon_type' => 'espada', 'durability' => 380, 'price' => 3800, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],
            ['name' => 'Sombra de Apache', 'description' => 'Servidor de daño.', 'damage' => 220, 'weapon_type' => 'espada', 'durability' => 90, 'price' => 15000, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],
            ['name' => 'Hacha de Forge', 'description' => 'Provisiona dolor.', 'damage' => 110, 'weapon_type' => 'hacha', 'durability' => 380, 'price' => 3200, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],
            ['name' => 'Mandoble PHP-FPM', 'description' => 'Procesos de ataque.', 'damage' => 185, 'weapon_type' => 'espada', 'durability' => 700, 'price' => 10500, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],
            ['name' => 'Hacha Monolítica', 'description' => 'Un solo bloque de destrucción.', 'damage' => 260, 'weapon_type' => 'hacha', 'durability' => 1200, 'price' => 29000, 'id_kingdom' => $idPHP, 'id_class' => $idGuerrero],

            // MAGO PHP (6)
            ['name' => 'Vara de Blade', 'description' => 'Renderizado directo.', 'damage' => 25, 'weapon_type' => 'varita', 'durability' => 100, 'price' => 380, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Báculo Laravel 11', 'description' => 'Elegancia absoluta.', 'damage' => 90, 'weapon_type' => 'baston', 'durability' => 250, 'price' => 2400, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Báculo de Xdebug', 'description' => 'Breakpoints de vida.', 'damage' => 130, 'weapon_type' => 'baston', 'durability' => 450, 'price' => 6200, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Cetro de PHP 8.4', 'description' => 'Propiedades JIT.', 'damage' => 170, 'weapon_type' => 'varita', 'durability' => 60, 'price' => 9500, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Grimorio de Pest', 'description' => 'Tests bellos.', 'damage' => 145, 'weapon_type' => 'baston', 'durability' => 500, 'price' => 6500, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Vara de Ray', 'description' => 'Debuggea al enemigo.', 'damage' => 210, 'weapon_type' => 'varita', 'durability' => 800, 'price' => 19000, 'id_kingdom' => $idPHP, 'id_class' => $idMago],

            // ARQUERO PHP (6)
            ['name' => 'Arco de Routing', 'description' => 'Rutas de flecha.', 'damage' => 35, 'weapon_type' => 'arco', 'durability' => 120, 'price' => 550, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Ballesta Composer', 'description' => 'Gestión de paquetes.', 'damage' => 55, 'weapon_type' => 'ballesta', 'durability' => 160, 'price' => 900, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Arco de Artisan', 'description' => 'Comandos remotos.', 'damage' => 80, 'weapon_type' => 'arco', 'durability' => 210, 'price' => 2100, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Ballesta Octane', 'description' => 'Persistencia total.', 'damage' => 190, 'weapon_type' => 'ballesta', 'durability' => 55, 'price' => 11000, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Arco de Sail', 'description' => 'Aislamiento Docker.', 'damage' => 155, 'weapon_type' => 'arco', 'durability' => 420, 'price' => 7200, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Arco de Blade UI', 'description' => 'Componentes letales.', 'damage' => 240, 'weapon_type' => 'arco', 'durability' => 900, 'price' => 24000, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],

            // PALADÍN PHP (6)
            ['name' => 'Martillo de TDD', 'description' => 'Test Driven destruction.', 'damage' => 135, 'weapon_type' => 'maza', 'durability' => 450, 'price' => 4800, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
            ['name' => 'Maza de PSR-12', 'description' => 'Estándares rígidos.', 'damage' => 60, 'weapon_type' => 'maza', 'durability' => 150, 'price' => 1100, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
            ['name' => 'Martillo Homestead', 'description' => 'Entorno seguro.', 'damage' => 100, 'weapon_type' => 'maza', 'durability' => 300, 'price' => 2800, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
            ['name' => 'Maza de Statamic', 'description' => 'Sin base de datos.', 'damage' => 170, 'weapon_type' => 'maza', 'durability' => 500, 'price' => 9200, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
            ['name' => 'Espada de Carbon', 'description' => 'Control del tiempo.', 'damage' => 210, 'weapon_type' => 'espada', 'durability' => 800, 'price' => 16000, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
            ['name' => 'Baluarte de Valet', 'description' => 'Servidor instantáneo.', 'damage' => 255, 'weapon_type' => 'maza', 'durability' => 1100, 'price' => 27000, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],

            // ASESINO PHP (6)
            ['name' => 'Daga Dinámica', 'description' => 'Tipado débil.', 'damage' => 28, 'weapon_type' => 'daga', 'durability' => 80, 'price' => 320, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
            ['name' => 'Daga Livewire', 'description' => 'Reactividad pura.', 'damage' => 65, 'weapon_type' => 'daga', 'durability' => 180, 'price' => 1400, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
            ['name' => 'Daga Inyectora', 'description' => 'Globales letales.', 'damage' => 140, 'weapon_type' => 'daga', 'durability' => 300, 'price' => 5500, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
            ['name' => 'Daga de Traits', 'description' => 'Reutilización.', 'damage' => 160, 'weapon_type' => 'daga', 'durability' => 40, 'price' => 8200, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
            ['name' => 'Hoja dd()', 'description' => 'Dump and Die.', 'damage' => 220, 'weapon_type' => 'daga', 'durability' => 700, 'price' => 18000, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
            ['name' => 'Estilete de Tinkerer', 'description' => 'Pruebas rápidas.', 'damage' => 275, 'weapon_type' => 'daga', 'durability' => 1000, 'price' => 31000, 'id_kingdom' => $idPHP, 'id_class' => $idAsesino],
        ];

        foreach ($weapons as $weaponData) {
            $item = Item::updateOrCreate(
                ['name' => $weaponData['name']],
                [
                    'description' => $weaponData['description'],
                    'type' => 'weapon',
                    'price' => $weaponData['price'],
                    'id_kingdom' => $weaponData['id_kingdom'],
                    'id_class' => $weaponData['id_class'],
                    'is_purchasable' => $weaponData['is_purchasable'] ?? true,
                ]
            );

            Weapon::updateOrCreate(
                ['id_item' => $item->id_item],
                [
                    'damage' => $weaponData['damage'],
                    'weapon_type' => $weaponData['weapon_type'],
                    'durability' => $weaponData['durability'],
                ]
            );
        }

        $this->createArmors();
        $this->createConsumables();
    }

    private function createArmors()
    {
        $idGuerrero = \App\Models\CharacterClass::where('name', 'Guerrero')->first()->id_class;
        $idMago = \App\Models\CharacterClass::where('name', 'Mago')->first()->id_class;
        $idArquero = \App\Models\CharacterClass::where('name', 'Arquero')->first()->id_class;
        $idPaladin = \App\Models\CharacterClass::where('name', 'Paladín')->first()->id_class;
        $idAsesino = \App\Models\CharacterClass::where('name', 'Asesino')->first()->id_class;

        $idPHP = 1;
        $idJava = 2;

        $armors = [
            // --- COMUNES (No comprables, equipo inicial) ---
            ['name' => 'Ropas de Viajero', 'description' => 'Protección mínima.', 'defense' => 5, 'armor_type' => 'armadura_ligera', 'durability' => 50, 'price' => 40, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => null],
            ['name' => 'Peto de Cuero Viejo', 'description' => 'Cuero desgastado.', 'defense' => 10, 'armor_type' => 'armadura_media', 'durability' => 80, 'price' => 120, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => null],
            ['name' => 'Escudo de Madera Circular', 'description' => 'Escudo simple.', 'defense' => 8, 'armor_type' => 'escudo', 'durability' => 70, 'price' => 90, 'id_kingdom' => null, 'is_purchasable' => false, 'id_class' => $idPaladin],

            // --- REINO JAVA ---
            ['name' => 'Coraza de Tipado Estático', 'description' => 'Validada.', 'defense' => 25, 'armor_type' => 'armadura_pesada', 'durability' => 180, 'price' => 450, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Escudo de Encapsulamiento', 'description' => 'Privacidad.', 'defense' => 35, 'armor_type' => 'escudo', 'durability' => 250, 'price' => 700, 'id_kingdom' => $idJava, 'id_class' => $idPaladin],
            ['name' => 'Yelmo de Compilación', 'description' => 'Detección errores.', 'defense' => 15, 'armor_type' => 'armadura_cabeza', 'durability' => 120, 'price' => 300, 'id_kingdom' => $idJava, 'id_class' => null],
            ['name' => 'Grebas de Polimorfismo', 'description' => 'Adaptación.', 'defense' => 20, 'armor_type' => 'armadura_pierna', 'durability' => 150, 'price' => 400, 'id_kingdom' => $idJava, 'id_class' => null],
            ['name' => 'Armadura de Seguridad de Oracle', 'description' => 'Impenetrable.', 'defense' => 80, 'armor_type' => 'armadura_pesada', 'durability' => 600, 'price' => 5000, 'id_kingdom' => $idJava, 'id_class' => $idGuerrero],
            ['name' => 'Capa de la JVM', 'description' => 'Aislamiento.', 'defense' => 50, 'armor_type' => 'armadura_ligera', 'durability' => 400, 'price' => 3500, 'id_kingdom' => $idJava, 'id_class' => $idMago],

            // --- REINO PHP ---
            ['name' => 'Túnica de Symfony', 'description' => 'Modular.', 'defense' => 22, 'armor_type' => 'armadura_ligera', 'durability' => 140, 'price' => 420, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Armadura de Cuero de Elefante', 'description' => 'Inspirada en el protector.', 'defense' => 38, 'armor_type' => 'armadura_media', 'durability' => 280, 'price' => 850, 'id_kingdom' => $idPHP, 'id_class' => $idArquero],
            ['name' => 'Capucha de Middlewares', 'description' => 'Filtro de daño.', 'defense' => 12, 'armor_type' => 'armadura_cabeza', 'durability' => 100, 'price' => 280, 'id_kingdom' => $idPHP, 'id_class' => null],
            ['name' => 'Pantalones de Despliegue Rápido', 'description' => 'Velocidad CI/CD.', 'defense' => 18, 'armor_type' => 'armadura_pierna', 'durability' => 130, 'price' => 380, 'id_kingdom' => $idPHP, 'id_class' => null],
            ['name' => 'Manto de la Comunidad PHP', 'description' => 'Respaldo total.', 'defense' => 75, 'armor_type' => 'armadura_ligera', 'durability' => 500, 'price' => 4800, 'id_kingdom' => $idPHP, 'id_class' => $idMago],
            ['name' => 'Baluarte de Nginx', 'description' => 'Miles de ataques.', 'defense' => 90, 'armor_type' => 'escudo', 'durability' => 800, 'price' => 6500, 'id_kingdom' => $idPHP, 'id_class' => $idPaladin],
        ];

        foreach ($armors as $armorData) {
            $item = Item::updateOrCreate(
                ['name' => $armorData['name']],
                [
                    'description' => $armorData['description'],
                    'type' => 'armor',
                    'price' => $armorData['price'],
                    'id_kingdom' => $armorData['id_kingdom'],
                    'id_class' => $armorData['id_class'],
                    'is_purchasable' => $armorData['is_purchasable'] ?? true,
                ]
            );

            Armor::updateOrCreate(
                ['id_item' => $item->id_item],
                [
                    'defense' => $armorData['defense'],
                    'armor_type' => $armorData['armor_type'],
                    'durability' => $armorData['durability'],
                ]
            );
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
                'price' => 25,
            ],
            [
                'name' => 'Poción de Maná',
                'description' => 'Recupera energía mágica rápidamente.',
                'effect' => 'mana_restore',
                'power' => 60,
                'duration' => null,
                'quantity' => 2,
                'price' => 22,
            ],
            [
                'name' => 'Elixir de Fuerza',
                'description' => 'Aumenta la fuerza temporalmente.',
                'effect' => 'buff_strength',
                'power' => 10,
                'duration' => 5,
                'quantity' => 1,
                'price' => 45,
            ],
            [
                'name' => 'Antídoto',
                'description' => 'Cura efectos de veneno y enfermedades.',
                'effect' => 'cure_poison',
                'power' => 100,
                'duration' => null,
                'quantity' => 2,
                'price' => 30,
            ],
            [
                'name' => 'Elixir de Vida',
                'description' => 'Elixir legendario que revive a los caídos.',
                'effect' => 'revive',
                'power' => 50,
                'duration' => null,
                'quantity' => 1,
                'price' => 120,
            ],
        ];

        foreach ($consumables as $consumableData) {
            $item = Item::updateOrCreate(
                ['name' => $consumableData['name']],
                [
                    'description' => $consumableData['description'],
                    'type' => 'consumable',
                    'price' => $consumableData['price'],
                ]
            );

            Consumable::updateOrCreate(
                ['id_item' => $item->id_item],
                [
                    'effect' => $consumableData['effect'],
                    'power' => $consumableData['power'],
                    'duration' => $consumableData['duration'],
                    'quantity' => $consumableData['quantity'],
                ]
            );
        }
    }
}
