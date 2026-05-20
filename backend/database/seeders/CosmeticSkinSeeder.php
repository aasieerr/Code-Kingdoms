<?php

namespace Database\Seeders;

use App\Models\CosmeticSkin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CosmeticSkinSeeder extends Seeder
{
    public function run(): void
    {
        $keepSlug = 'asier';

        $obsoleteIds = CosmeticSkin::query()
            ->where('slug', '!=', $keepSlug)
            ->pluck('id');

        foreach ($obsoleteIds as $skinId) {
            DB::table('user_skin')->where('skin_id', $skinId)->delete();
            DB::table('characters')->where('equipped_skin_id', $skinId)->update(['equipped_skin_id' => null]);
        }

        CosmeticSkin::query()->where('slug', '!=', $keepSlug)->delete();

        CosmeticSkin::query()->updateOrCreate(
            ['slug' => $keepSlug],
            [
                'name' => 'Asier',
                'slug' => $keepSlug,
                'color_still' => '#1e293b',
                'color_moving' => '#64748b',
                'price_code_coins' => 750,
            ],
        );
    }
}
