<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CharacterItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_character' => $this->faker->numberBetween(1, 5),
            'id_item' => $this->faker->numberBetween(1, 10),
            'quantity' => $this->faker->numberBetween(1, 10),
            'is_equipped' => $this->faker->boolean(),
        ];
    }
}
