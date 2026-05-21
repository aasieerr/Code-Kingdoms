<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ArmorFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_item' => null, // Se asignará al crear el item
            'defense' => $this->faker->numberBetween(5, 30),
            'armor_type' => $this->faker->randomElement(['armadura_pesada', 'armadura_ligera', 'armadura_media', 'escudo', 'yelmo']),
            'durability' => $this->faker->numberBetween(50, 100),
        ];
    }

    public function heavyArmor(): self
    {
        return $this->state(fn (array $attributes) => [
            'defense' => $this->faker->numberBetween(20, 35),
            'armor_type' => 'armadura_pesada',
            'durability' => $this->faker->numberBetween(80, 100),
        ]);
    }

    public function lightArmor(): self
    {
        return $this->state(fn (array $attributes) => [
            'defense' => $this->faker->numberBetween(8, 18),
            'armor_type' => 'armadura_ligera',
            'durability' => $this->faker->numberBetween(60, 85),
        ]);
    }

    public function shield(): self
    {
        return $this->state(fn (array $attributes) => [
            'defense' => $this->faker->numberBetween(10, 25),
            'armor_type' => 'escudo',
            'durability' => $this->faker->numberBetween(70, 95),
        ]);
    }
}
