<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ConsumableFactory extends Factory
{
    public function definition(): array
    {
        return [
            'id_item' => null, // Se asignará al crear el item
            'effect' => $this->faker->randomElement(['heal', 'mana_restore', 'buff_strength', 'buff_agility', 'cure_poison', 'revive']),
            'power' => $this->faker->numberBetween(20, 100),
            'duration' => $this->faker->optional(0.3)->numberBetween(1, 5), // 30% de los consumibles tienen duración
            'quantity' => $this->faker->numberBetween(1, 5),
        ];
    }

    public function healingPotion(): self
    {
        return $this->state(fn (array $attributes) => [
            'effect' => 'heal',
            'power' => $this->faker->numberBetween(50, 150),
            'duration' => null, // Instantáneo
            'quantity' => $this->faker->numberBetween(1, 3),
        ]);
    }

    public function manaPotion(): self
    {
        return $this->state(fn (array $attributes) => [
            'effect' => 'mana_restore',
            'power' => $this->faker->numberBetween(40, 120),
            'duration' => null, // Instantáneo
            'quantity' => $this->faker->numberBetween(1, 3),
        ]);
    }

    public function strengthBuff(): self
    {
        return $this->state(fn (array $attributes) => [
            'effect' => 'buff_strength',
            'power' => $this->faker->numberBetween(5, 15),
            'duration' => $this->faker->numberBetween(3, 8),
            'quantity' => 1,
        ]);
    }

    public function antidote(): self
    {
        return $this->state(fn (array $attributes) => [
            'effect' => 'cure_poison',
            'power' => 100, // 100% de efectividad
            'duration' => null, // Instantáneo
            'quantity' => $this->faker->numberBetween(1, 2),
        ]);
    }
}
