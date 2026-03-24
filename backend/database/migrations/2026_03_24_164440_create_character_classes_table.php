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
        Schema::create('character_classes', function (Blueprint $table) {
            $table->id('id_class');
            $table->string('name');
            $table->text('description');
            $table->json('allowed_weapons')->nullable(); // Array de IDs de armas permitidas
            $table->json('allowed_armors')->nullable(); // Array de IDs de armaduras permitidas
            $table->json('starting_skills')->nullable(); // Array de IDs de habilidades iniciales
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('character_classes');
    }
};
