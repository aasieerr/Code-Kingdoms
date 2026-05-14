<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Deja solo la skin `asier` (750 CodeCoins) y elimina el resto.
     * Así `php artisan migrate` corrige instalaciones que aún tienen skins de color.
     */
    public function up(): void
    {
        $obsoleteIds = DB::table('cosmetic_skins')->where('slug', '!=', 'asier')->pluck('id');

        foreach ($obsoleteIds as $skinId) {
            DB::table('user_skin')->where('skin_id', $skinId)->delete();
            DB::table('characters')->where('equipped_skin_id', $skinId)->update(['equipped_skin_id' => null]);
        }

        DB::table('cosmetic_skins')->where('slug', '!=', 'asier')->delete();

        $now = now();
        $row = DB::table('cosmetic_skins')->where('slug', 'asier')->first();

        if ($row) {
            DB::table('cosmetic_skins')->where('slug', 'asier')->update([
                'name' => 'Asier',
                'color_still' => '#1e293b',
                'color_moving' => '#64748b',
                'price_code_coins' => 750,
                'updated_at' => $now,
            ]);
        } else {
            DB::table('cosmetic_skins')->insert([
                'name' => 'Asier',
                'slug' => 'asier',
                'color_still' => '#1e293b',
                'color_moving' => '#64748b',
                'price_code_coins' => 750,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        // No restauramos skins eliminadas.
    }
};
