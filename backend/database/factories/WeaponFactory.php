<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Weapon>
 */
class WeaponFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id_item' => null, // Se asignará al crear el item
            'damage' => $this->faker->numberBetween(10, 50),
            'weapon_type' => $this->faker->randomElement(['espada', 'hacha', 'arco', 'baston', 'daga', 'lanza', 'maza']),
            'durability' => $this->faker->numberBetween(50, 100),
        ];
    }

    /**
     * Arma de guerrero
     */
    public function warriorWeapon(): self
    {
        return $this->state(fn (array $attributes) => [
            'damage' => $this->faker->numberBetween(25, 45),
            'weapon_type' => $this->faker->randomElement(['espada', 'hacha', 'maza', 'lanza']),
            'durability' => $this->faker->numberBetween(80, 100),
        ]);
    }

    /**
     * Arma de mago
     */
    public function mageWeapon(): self
    {
        return $this->state(fn (array $attributes) => [
            'damage' => $this->faker->numberBetween(15, 35),
            'weapon_type' => $this->faker->randomElement(['baston', 'varita', 'daga']),
            'durability' => $this->faker->numberBetween(60, 90),
        ]);
    }

    /**
     * Arma de arquero
     */
    public function archerWeapon(): self
    {
        return $this->state(fn (array $attributes) => [
            'damage' => $this->faker->numberBetween(20, 40),
            'weapon_type' => $this->faker->randomElement(['arco', 'ballesta', 'daga']),
            'durability' => $this->faker->numberBetween(70, 95),
        ]);
    }
}
