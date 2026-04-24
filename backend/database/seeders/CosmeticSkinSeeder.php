<?php

namespace Database\Seeders;

use App\Models\CosmeticSkin;
use Illuminate\Database\Seeder;

class CosmeticSkinSeeder extends Seeder
{
    public function run(): void
    {
        $skins = [
            ['name' => 'Cian neón', 'slug' => 'cian', 'color_still' => '#00bcd4', 'color_moving' => '#4dd0e1', 'price_code_coins' => 50],
            ['name' => 'Magenta', 'slug' => 'magenta', 'color_still' => '#d81b60', 'color_moving' => '#f06292', 'price_code_coins' => 75],
            ['name' => 'Lima', 'slug' => 'lima', 'color_still' => '#8bc34a', 'color_moving' => '#c5e1a5', 'price_code_coins' => 100],
            ['name' => 'Naranja brasa', 'slug' => 'naranja', 'color_still' => '#ff6d00', 'color_moving' => '#ffab40', 'price_code_coins' => 150],
            ['name' => 'Violeta real', 'slug' => 'violeta', 'color_still' => '#5e35b1', 'color_moving' => '#9c27b0', 'price_code_coins' => 200],
        ];

        foreach ($skins as $s) {
            CosmeticSkin::query()->updateOrCreate(
                ['slug' => $s['slug']],
                $s
            );
        }
    }
}
