<?php

namespace App\Http\Controllers;

use App\Models\Skill;
use Illuminate\Http\Request;

class SkillController extends Controller
{
    /**
     * Obtener todas las habilidades
     */
    public function index()
    {
        return Skill::with('characterClass')->get();
    }

    /**
     * Obtener una habilidad por ID
     */
    public function show($id)
    {
        $skill = Skill::with('characterClass')->find($id);

        if (!$skill) {
            return response()->json(['message' => 'Habilidad no encontrada'], 404);
        }

        return $skill;
    }

    /**
     * Obtener habilidades por clase
     */
    public function getByClass($classId)
    {
        return Skill::where('id_class', $classId)->with('characterClass')->get();
    }
}
