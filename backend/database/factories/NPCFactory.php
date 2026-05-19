<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class NPCFactory extends Factory
{
    public function definition(): array
    {
        return [
            'nombre' => $this->faker->name(),
            'descripcion' => $this->faker->sentence(),
            'dialogos' => [
                $this->faker->sentence(),
                $this->faker->sentence(),
                $this->faker->sentence(),
            ],
            'tipo' => $this->faker->randomElement(['normal', 'vendedor']),
            'map' => 'MainGame',
            'id_kingdom' => null,
            'shop_type' => null,
            'x' => $this->faker->numberBetween(0, 2000),
            'y' => $this->faker->numberBetween(0, 2000),
        ];
    }
}
