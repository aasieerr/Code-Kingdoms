<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cosmetic_skins', function (Blueprint $table) {
            $table->id();
            $table->string('name', 80);
            $table->string('slug', 64)->unique();
            $table->string('color_still', 16);
            $table->string('color_moving', 16);
            $table->unsignedInteger('price_code_coins');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cosmetic_skins');
    }
};
