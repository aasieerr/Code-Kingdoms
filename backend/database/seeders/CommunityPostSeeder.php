<?php

namespace Database\Seeders;

use App\Models\CommunityPost;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class CommunityPostSeeder extends Seeder
{
    public function run(): void
    {
        CommunityPost::query()->where('is_featured', true)->delete();

        $assetRoot = database_path('seeders/assets/community');

        $showcaseUsers = [
            ['name' => 'Laura M.', 'email' => 'laura.community@code-kingdoms.local'],
            ['name' => 'Carlos R.', 'email' => 'carlos.community@code-kingdoms.local'],
            ['name' => 'Nina P.', 'email' => 'nina.community@code-kingdoms.local'],
            ['name' => 'Jorge A.', 'email' => 'jorge.community@code-kingdoms.local'],
            ['name' => 'Sofía V.', 'email' => 'sofia.community@code-kingdoms.local'],
            ['name' => 'Diego L.', 'email' => 'diego.community@code-kingdoms.local'],
            ['name' => 'Aitana G.', 'email' => 'aitana.community@code-kingdoms.local'],
            ['name' => 'Marcos T.', 'email' => 'marcos.community@code-kingdoms.local'],
        ];

        $featuredPosts = [
            [
                'email' => 'laura.community@code-kingdoms.local',
                'file' => 'laravel-citadel-map.png',
                'faction' => 'PHP',
                'character_name' => 'Mystra',
                'caption' => 'Por fin pasé la Ciudadela Laravel con mi maga. ¿A alguien más se le atascó el miniboss del patio?',
            ],
            [
                'email' => 'carlos.community@code-kingdoms.local',
                'file' => 'spring-boot-city-map.png',
                'faction' => 'JAVA',
                'character_name' => 'ByteKnight',
                'caption' => 'Primera captura en Spring Boot City antes de que empezara la oleada. El mapa queda brutal de noche.',
            ],
            [
                'email' => 'nina.community@code-kingdoms.local',
                'file' => 'php-frontier-marshes-map.png',
                'faction' => 'PHP',
                'character_name' => 'Nyx',
                'caption' => 'Subo esto porque me costó un montón cruzar los pantanos PHP con equipo básico. Si alguien va por aquí, id con pociones.',
            ],
            [
                'email' => 'jorge.community@code-kingdoms.local',
                'file' => 'jvm-volcano-map.png',
                'faction' => 'JAVA',
                'character_name' => 'Kael',
                'caption' => 'Entrada al volcán JVM después de limpiar la arena. ¿Hay grupo para la siguiente zona o voy solo?',
            ],
            [
                'email' => 'sofia.community@code-kingdoms.local',
                'file' => 'blade-forest-map.png',
                'faction' => 'PHP',
                'character_name' => 'Riven',
                'caption' => 'Me flipa cómo se ve Blade Forest tras el boss. Lo dejé aquí para comparar cuando vuelva con mejor equipo.',
            ],
            [
                'email' => 'diego.community@code-kingdoms.local',
                'file' => 'hibernate-ruins-map.png',
                'faction' => 'JAVA',
                'character_name' => 'Orin',
                'caption' => 'Ruinas de Hibernate recuperadas con un amigo del clan. Si alguien necesita la ruta corta, la paso por privado.',
            ],
            [
                'email' => 'aitana.community@code-kingdoms.local',
                'file' => 'laravel-citadel-map.png',
                'faction' => 'PHP',
                'character_name' => 'Sera',
                'caption' => 'No es una run perfecta, pero quería dejar constancia de que por fin avancé en la región PHP esta semana.',
            ],
            [
                'email' => 'marcos.community@code-kingdoms.local',
                'file' => 'spring-boot-city-map.png',
                'faction' => 'JAVA',
                'character_name' => 'Taro',
                'caption' => 'Probando capturas con F8 para enseñarle el juego a un colega. ¿Se ve bien la UI o recorto más HUD la próxima?',
            ],
        ];

        Storage::disk('public')->makeDirectory('community/featured');

        $usersByEmail = [];

        foreach ($showcaseUsers as $showcaseUser) {
            $usersByEmail[$showcaseUser['email']] = User::query()->updateOrCreate(
                ['email' => $showcaseUser['email']],
                [
                    'name' => $showcaseUser['name'],
                    'password' => Hash::make('password'),
                    'avatar_path' => null,
                ],
            );
        }

        foreach ($featuredPosts as $post) {
            $user = $usersByEmail[$post['email']] ?? null;
            if (! $user) {
                continue;
            }

            $sourcePath = $assetRoot.DIRECTORY_SEPARATOR.$post['file'];
            if (! File::exists($sourcePath)) {
                continue;
            }

            $targetPath = 'community/featured/'.$post['file'];
            if (! Storage::disk('public')->exists($targetPath)) {
                Storage::disk('public')->put($targetPath, File::get($sourcePath));
            }

            CommunityPost::query()->create([
                'user_id' => $user->id,
                'screenshot_id' => null,
                'image_path' => $targetPath,
                'character_name' => $post['character_name'],
                'faction' => $post['faction'],
                'caption' => $post['caption'],
                'is_featured' => true,
                'created_at' => now()->subDays(random_int(1, 12))->subHours(random_int(1, 20)),
            ]);
        }
    }
}
