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
        Schema::create('character_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_character');
            $table->unsignedBigInteger('id_item');
            $table->integer('quantity')->default(1);
            $table->boolean('is_equipped')->default(false);
            $table->timestamps();

            $table->foreign('id_character')->references('id')->on('characters')->onDelete('cascade');
            $table->foreign('id_item')->references('id_item')->on('items')->onDelete('cascade');

            $table->unique(['id_character', 'id_item']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('character_items');
    }
};
