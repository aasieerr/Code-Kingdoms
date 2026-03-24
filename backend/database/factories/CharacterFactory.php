<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Character>
 */
class CharacterFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_user' => \App\Models\User::factory(), // o random existing
            'id_kingdom' => $this->faker->numberBetween(1, 5),
            'id_race' => $this->faker->numberBetween(1, 5),
            'id_class' => $this->faker->numberBetween(1, 5),
            'name' => $this->faker->name(),
            'level' => 1,
            'experience' => $this->faker->numberBetween(0, 1000),
            'health' => $this->faker->numberBetween(50, 100),
            'mana' => $this->faker->numberBetween(20, 80),
            'gold' => $this->faker->numberBetween(0, 500),
        ];
    }
}
