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
        Schema::create('armors', function (Blueprint $table) {
            $table->unsignedBigInteger('id_item')->primary();
            $table->foreign('id_item')->references('id_item')->on('items')->onDelete('cascade');
            $table->integer('defense');
            $table->string('armor_type')->nullable(); // armadura_pesada, ligera, etc.
            $table->integer('durability')->default(100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('armors');
    }
};
