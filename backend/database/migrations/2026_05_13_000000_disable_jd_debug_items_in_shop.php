<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Ítems de depuración: no deben listarse en la tienda (ItemController filtra is_purchasable).
     */
    public function up(): void
    {
        DB::table('items')->whereIn('name', [
            'Arma Definitiva de JD',
            'Armadura Definitiva de JD',
        ])->update(['is_purchasable' => false]);
    }

    public function down(): void
    {
        DB::table('items')->whereIn('name', [
            'Arma Definitiva de JD',
            'Armadura Definitiva de JD',
        ])->update(['is_purchasable' => true]);
    }
};
