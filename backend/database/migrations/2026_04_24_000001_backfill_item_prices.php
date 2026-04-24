<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Asigna precios a filas ya existentes (precio 0 tras add_price) sin duplicar seeders.
     */
    public function up(): void
    {
        $map = [
            'Espada del Guerrero' => 180,
            'Varita Arcana' => 150,
            'Arco de Roble' => 165,
            'Hacha de Batalla' => 200,
            'Daga Asesina' => 120,
            'Armadura de Placas' => 220,
            'Túnica Mágica' => 140,
            'Escudo de Acero' => 160,
            'Armadura de Cuero' => 150,
            'Poción de Curación' => 25,
            'Poción de Maná' => 22,
            'Elixir de Fuerza' => 45,
            'Antídoto' => 30,
            'Elixir de Vida' => 120,
        ];

        foreach ($map as $name => $price) {
            DB::table('items')->where('name', $name)->update(['price' => $price]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
