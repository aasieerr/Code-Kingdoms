<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Race>
 */
class RaceFactory extends Factory
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
            'strength_bonus' => $this->faker->numberBetween(-2, 3),
            'agility_bonus' => $this->faker->numberBetween(-2, 3),
            'intelligence_bonus' => $this->faker->numberBetween(-2, 3),
            'vitality_bonus' => $this->faker->numberBetween(-2, 3),
            'luck_bonus' => $this->faker->numberBetween(-2, 3),
        ];
    }

    /**
     * Raza Humana
     */
    public function human(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Humano',
            'strength_bonus' => 1,
            'agility_bonus' => 1,
            'intelligence_bonus' => 1,
            'vitality_bonus' => 1,
            'luck_bonus' => 1,
        ]);
    }

    /**
     * Raza Elfo
     */
    public function elf(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Elfo',
            'strength_bonus' => -1,
            'agility_bonus' => 3,
            'intelligence_bonus' => 2,
            'vitality_bonus' => -1,
            'luck_bonus' => 1,
        ]);
    }

    /**
     * Raza Enano
     */
    public function dwarf(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Enano',
            'strength_bonus' => 2,
            'agility_bonus' => -1,
            'intelligence_bonus' => 0,
            'vitality_bonus' => 3,
            'luck_bonus' => -1,
        ]);
    }

    /**
     * Raza Orco
     */
    public function orc(): self
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'Orco',
            'strength_bonus' => 3,
            'agility_bonus' => 0,
            'intelligence_bonus' => -2,
            'vitality_bonus' => 2,
            'luck_bonus' => -1,
        ]);
    }
}
