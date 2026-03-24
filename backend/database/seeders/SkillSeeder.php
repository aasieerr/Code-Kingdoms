<?php

namespace Database\Seeders;

use App\Models\CharacterClass;
use App\Models\Skill;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $classes = CharacterClass::all();

        foreach ($classes as $class) {
            $skillCount = rand(3, 5); // Cada clase tiene 3-5 habilidades

            for ($i = 0; $i < $skillCount; $i++) {
                switch ($class->name) {
                    case 'Guerrero':
                        Skill::factory()->warriorSkill()->create(['id_class' => $class->id_class]);
                        break;
                    case 'Mago':
                        Skill::factory()->mageSkill()->create(['id_class' => $class->id_class]);
                        break;
                    case 'Arquero':
                        Skill::factory()->archerSkill()->create(['id_class' => $class->id_class]);
                        break;
                    case 'Paladín':
                        Skill::factory()->paladinSkill()->create(['id_class' => $class->id_class]);
                        break;
                    case 'Asesino':
                        Skill::factory()->assassinSkill()->create(['id_class' => $class->id_class]);
                        break;
                }
            }
        }
    }
}
