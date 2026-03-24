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
        Schema::create('skills', function (Blueprint $table) {
            $table->id('id_skill');
            $table->unsignedBigInteger('id_class');
            $table->foreign('id_class')->references('id_class')->on('character_classes')->onDelete('cascade');
            $table->string('name', 50);
            $table->integer('mana_cost');
            $table->integer('power');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('skills');
    }
};
