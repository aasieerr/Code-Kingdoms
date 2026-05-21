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
        Schema::create('weapons', function (Blueprint $table) {
            $table->unsignedBigInteger('id_item')->primary();
            $table->foreign('id_item')->references('id_item')->on('items')->onDelete('cascade');
            $table->integer('damage');
            $table->string('weapon_type')->nullable(); // espada, hacha, arco, etc.
            $table->integer('durability')->default(100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weapons');
    }
};
