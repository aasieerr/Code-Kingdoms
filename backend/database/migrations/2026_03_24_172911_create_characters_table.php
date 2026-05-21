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
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_user');
            $table->unsignedBigInteger('id_kingdom');
            $table->unsignedBigInteger('id_race');
            $table->unsignedBigInteger('id_class');
            $table->string('name', 50);
            $table->integer('level')->default(1);
            $table->bigInteger('experience');
            $table->integer('health');
            $table->integer('mana');
            $table->integer('gold');
            $table->timestamps();

            $table->foreign('id_user')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('id_kingdom')->references('id_kingdom')->on('kingdoms');
            $table->foreign('id_race')->references('id_race')->on('races');
            $table->foreign('id_class')->references('id_class')->on('character_classes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
