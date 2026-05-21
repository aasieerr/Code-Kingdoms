<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SkillFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_class' => null,
            'name' => $this->faker->words(2, true),
            'mana_cost' => $this->faker->numberBetween(5, 50),
            'power' => $this->faker->numberBetween(10, 100),
        ];
    }

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
