<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('consumables', function (Blueprint $table) {
            $table->unsignedBigInteger('id_item')->primary();
            $table->foreign('id_item')->references('id_item')->on('items')->onDelete('cascade');
            $table->string('effect'); // heal, mana_restore, buff, etc.
            $table->integer('power'); // cantidad de curación, maná, etc.
            $table->integer('duration')->nullable(); // duración en turnos (null para instantáneo)
            $table->integer('quantity')->default(1); // cantidad por stack
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('consumables');
    }
};
