<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\King>
 */
class KingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->firstName(),
            'description' => $this->faker->sentence(8),
            'id_kingdom' => null,
        ];
    }

    /**
     * Rey de Peachepe
     */
    public function peachepe(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Rey Peachepe',
        ]);
    }

    /**
     * Rey de Java
     */
    public function java(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Rey Java',
        ]);
    }
}
