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
        Schema::table('kingdoms', function (Blueprint $table) {
            $table->foreign('id_king')->references('id_king')->on('kings')->onDelete('set null');
        });

        Schema::table('kings', function (Blueprint $table) {
            $table->foreign('id_kingdom')->references('id_kingdom')->on('kingdoms')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('kingdoms', function (Blueprint $table) {
            $table->dropForeign(['id_king']);
        });

        Schema::table('kings', function (Blueprint $table) {
            $table->dropForeign(['id_kingdom']);
        });
    }
};
