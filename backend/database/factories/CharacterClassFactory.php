<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\CharacterClass>
 */
class CharacterClassFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(8),
            'allowed_weapons' => [],
            'allowed_armors' => [],
            'starting_skills' => [],
        ];
    }

    /**
     * Clase Guerrero
     */
    public function warrior(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Guerrero',
            'description' => 'Maestro del combate cuerpo a cuerpo, experto con espadas, hachas y escudos. Alta resistencia y fuerza.',
            'allowed_weapons' => ['espada', 'hacha', 'maza', 'lanza', 'escudo'],
            'allowed_armors' => ['armadura_pesada', 'armadura_media', 'escudo'],
            'starting_skills' => ['golpe_poderoso', 'defensa', 'carga'],
        ]);
    }

    /**
     * Clase Mago
     */
    public function mage(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Mago',
            'description' => 'Manipulador de la magia arcana, especialista en hechizos ofensivos y defensivos. Alta inteligencia.',
            'allowed_weapons' => ['varita', 'baston', 'daga'],
            'allowed_armors' => ['tunica', 'armadura_ligera'],
            'starting_skills' => ['bola_fuego', 'escudo_magico', 'teleportacion'],
        ]);
    }

    /**
     * Clase Arquero
     */
    public function archer(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Arquero',
            'description' => 'Maestro del combate a distancia, experto con arcos y flechas. Alta agilidad y precisión.',
            'allowed_weapons' => ['arco', 'ballesta', 'daga'],
            'allowed_armors' => ['armadura_ligera', 'armadura_media'],
            'starting_skills' => ['disparo_preciso', 'flecha_multiple', 'esquiva'],
        ]);
    }

    /**
     * Clase Paladín
     */
    public function paladin(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Paladín',
            'description' => 'Guerrero sagrado bendecido por los dioses, combina fuerza marcial con magia divina.',
            'allowed_weapons' => ['espada', 'maza', 'escudo', 'lanza'],
            'allowed_armors' => ['armadura_pesada', 'escudo'],
            'starting_skills' => ['sanacion', 'golpe_sagrado', 'proteccion_divina'],
        ]);
    }

    /**
     * Clase Asesino
     */
    public function assassin(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Asesino',
            'description' => 'Sombra letal especializada en ataques furtivos y venenos. Alta agilidad y sigilo.',
            'allowed_weapons' => ['daga', 'espada_corta', 'arco_corto'],
            'allowed_armors' => ['armadura_ligera'],
            'starting_skills' => ['golpe_traicionero', 'sigilo', 'veneno'],
        ]);
    }
}
