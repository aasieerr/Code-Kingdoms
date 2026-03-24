<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Skill>
 */
class SkillFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_class' => null,
            'name' => $this->faker->words(2, true),
            'mana_cost' => $this->faker->numberBetween(5, 50),
            'power' => $this->faker->numberBetween(10, 100),
        ];
    }

    /**
     * Habilidad de Guerrero
     */
    public function warriorSkill(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement([
                'Golpe Poderoso',
                'Carga Heroica',
                'Defensa Inquebrantable',
                'Furia del Guerrero',
                'Sintaxis Mortal'
            ]),
            'mana_cost' => $this->faker->numberBetween(10, 30),
            'power' => $this->faker->numberBetween(25, 80),
        ]);
    }

    /**
     * Habilidad de Mago
     */
    public function mageSkill(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement([
                'Bola de Fuego',
                'Rayo Arcano',
                'Escudo Mágico',
                'Teletransportación',
                'Congelación'
            ]),
            'mana_cost' => $this->faker->numberBetween(15, 45),
            'power' => $this->faker->numberBetween(30, 90),
        ]);
    }

    /**
     * Habilidad de Arquero
     */
    public function archerSkill(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement([
                'Disparo Preciso',
                'Lluvia de Flechas',
                'Esquiva Rápida',
                'Tiro Certero',
                'Velocidad del Viento'
            ]),
            'mana_cost' => $this->faker->numberBetween(8, 25),
            'power' => $this->faker->numberBetween(20, 70),
        ]);
    }

    /**
     * Habilidad de Paladín
     */
    public function paladinSkill(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement([
                'Sanación Divina',
                'Golpe Sagrado',
                'Protección Celestial',
                'Juicio Divino',
                'Bendición'
            ]),
            'mana_cost' => $this->faker->numberBetween(12, 35),
            'power' => $this->faker->numberBetween(15, 85),
        ]);
    }

    /**
     * Habilidad de Asesino
     */
    public function assassinSkill(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => $this->faker->randomElement([
                'Golpe Traicionero',
                'Sigilo Mortal',
                'Veneno Letal',
                'Ataque Furtivo',
                'Sombra Asesina'
            ]),
            'mana_cost' => $this->faker->numberBetween(5, 20),
            'power' => $this->faker->numberBetween(35, 95),
        ]);
    }
}
