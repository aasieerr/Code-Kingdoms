<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Kingdom>
 */
class KingdomFactory extends Factory
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
            'description' => $this->faker->sentence(10),
            'realm' => $this->faker->randomElement(['Peachepe', 'Java']),
            //'id_king' => null,
        ];
    }

    /**
     * Estado para el reino de Peachepe
     */
    public function peachepe(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Peachepe',
            'realm' => 'Peachepe',
            'description' => 'El gran reino de Peachepe, tierra de abundancia y prosperidad.',
        ]);
    }

    /**
     * Estado para el reino de Java
     */
    public function java(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Java',
            'realm' => 'Java',
            'description' => 'El poderoso reino de Java, forjado en volcanes y leyendas antiguas.',
        ]);
    }
}
