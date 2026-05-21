<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('characters', function (Blueprint $table) {
            $table->unsignedTinyInteger('arena_section')->default(1)->after('gold');
            $table->unsignedTinyInteger('arena_wave')->default(1)->after('arena_section');
            $table->boolean('arena_in_progress')->default(false)->after('arena_wave');
        });
    }

    public function down(): void
    {
        Schema::table('characters', function (Blueprint $table) {
            $table->dropColumn(['arena_section', 'arena_wave', 'arena_in_progress']);
        });
    }
};
