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
        Schema::create('races', function (Blueprint $table) {
            $table->id('id_race');
            $table->string('name');
            $table->integer('strength_bonus')->default(0);
            $table->integer('agility_bonus')->default(0);
            $table->integer('intelligence_bonus')->default(0);
            $table->integer('vitality_bonus')->default(0);
            $table->integer('luck_bonus')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('races');
    }
};
