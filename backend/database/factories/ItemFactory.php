<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class ItemFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->words(2, true),
            'description' => $this->faker->sentence(8),
            'type' => $this->faker->randomElement(['weapon', 'armor', 'consumable']),
            'price' => $this->faker->numberBetween(20, 250),
        ];
    }

    public function weapon(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'weapon',
            'name' => $this->faker->randomElement([
                'Espada Larga',
                'Hacha de Guerra',
                'Arco Largo',
                'Bastón Arcano',
                'Daga Venenosa'
            ]),
            'description' => $this->faker->randomElement([
                'Una espada forjada con acero de alta calidad.',
                'Hacha legendaria usada por antiguos guerreros.',
                'Arco preciso tallado en madera de roble antiguo.',
                'Bastón imbuido con energía mágica pura.',
                'Daga ligera ideal para ataques furtivos.'
            ]),
        ]);
    }

    public function armor(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'armor',
            'name' => $this->faker->randomElement([
                'Armadura de Placas',
                'Túnica Mágica',
                'Armadura de Cuero',
                'Escudo de Acero',
                'Yelmo de Caballero'
            ]),
            'description' => $this->faker->randomElement([
                'Armadura completa que protege contra ataques físicos.',
                'Túnica tejida con hilos encantados.',
                'Armadura ligera pero resistente.',
                'Escudo reforzado con acero templado.',
                'Yelmo que protege la cabeza del caballero.'
            ]),
        ]);
    }

    public function consumable(): self
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'consumable',
            'name' => $this->faker->randomElement([
                'Poción de Curación',
                'Poción de Maná',
                'Poción de Fuerza',
                'Antídoto',
                'Elixir de Vida'
            ]),
            'description' => $this->faker->randomElement([
                'Restaura puntos de vida al instante.',
                'Recupera energía mágica rápidamente.',
                'Aumenta la fuerza temporalmente.',
                'Cura efectos de veneno y enfermedades.',
                'Elixir legendario que revive a los caídos.'
            ]),
        ]);
    }
}
