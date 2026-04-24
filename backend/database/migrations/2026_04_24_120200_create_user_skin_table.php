<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_skin', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('skin_id')->constrained('cosmetic_skins')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'skin_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_skin');
    }
};
