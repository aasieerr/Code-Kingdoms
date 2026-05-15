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
        Schema::table('characters', function (Blueprint $table) {
            $table->integer('max_health')->default(100)->after('health');
            $table->integer('max_mana')->default(50)->after('mana');
            $table->integer('attack_power')->default(10)->after('max_mana');
            $table->integer('speed')->default(100)->after('attack_power');
            $table->integer('stat_points')->default(0)->after('speed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('characters', function (Blueprint $table) {
            $table->dropColumn(['max_health', 'max_mana', 'attack_power', 'speed', 'stat_points']);
        });
    }
};
