<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class KingdomFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(10),
            'realm' => $this->faker->randomElement(['Peachepe', 'Java']),
        ];
    }

    public function peachepe(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Peachepe',
            'realm' => 'Peachepe',
            'description' => 'El gran reino de Peachepe, tierra de abundancia y prosperidad.',
        ]);
    }

    public function java(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Java',
            'realm' => 'Java',
            'description' => 'El poderoso reino de Java, forjado en volcanes y leyendas antiguas.',
        ]);
    }
}
