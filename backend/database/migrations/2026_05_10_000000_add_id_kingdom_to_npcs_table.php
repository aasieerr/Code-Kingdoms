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
        Schema::table('npcs', function (Blueprint $table) {
            // Nullable to avoid breaking existing seeders / data
            $table->unsignedBigInteger('id_kingdom')->nullable()->after('id');
            $table->foreign('id_kingdom')->references('id_kingdom')->on('kingdoms')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('npcs', function (Blueprint $table) {
            $table->dropForeign(['id_kingdom']);
            $table->dropColumn('id_kingdom');
        });
    }
};
