<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('characters', function (Blueprint $table) {
            $table->foreignId('equipped_skin_id')
                ->nullable()
                ->after('gold')
                ->constrained('cosmetic_skins');
        });
    }

    public function down(): void
    {
        Schema::table('characters', function (Blueprint $table) {
            $table->dropForeign(['equipped_skin_id']);
        });
    }
};
