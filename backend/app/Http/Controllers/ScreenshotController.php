<?php

namespace App\Http\Controllers;

use App\Models\Screenshot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ScreenshotController extends Controller
{
    public function index(Request $request)
    {
        $screenshots = Screenshot::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($screenshot) {
                $screenshot->image_url = Storage::disk('public')->url($screenshot->image_path);
                return $screenshot;
            });

        return response()->json($screenshots);
    }

    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|string', // Base64 string
        ]);

        $image = $request->input('image');
        // Limpiar cabecera data:image/xxx;base64, de forma flexible
        $image = preg_replace('/^data:image\/\w+;base64,/', '', $image);
        $image = str_replace(' ', '+', $image);
        $imageName = Str::random(10) . '_' . time() . '.png';
        $path = 'screenshots/' . $imageName;

        // Asegurar que el directorio existe
        if (!Storage::disk('public')->exists('screenshots')) {
            Storage::disk('public')->makeDirectory('screenshots');
        }

        Storage::disk('public')->put($path, base64_decode($image));
        
        if (!Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'Failed to save image to disk'], 500);
        }

        $screenshot = Screenshot::create([
            'user_id' => $request->user()->id,
            'character_name' => $request->input('character_name'),
            'image_path' => $path,
        ]);

        $screenshot->image_url = Storage::disk('public')->url($screenshot->image_path);

        return response()->json([
            'message' => 'Screenshot saved successfully',
            'screenshot' => $screenshot
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $screenshot = Screenshot::where('user_id', $request->user()->id)->findOrFail($id);
        
        // Borrar el archivo físico
        if (Storage::disk('public')->exists($screenshot->image_path)) {
            Storage::disk('public')->delete($screenshot->image_path);
        }

        $screenshot->delete();

        return response()->json(['message' => 'Screenshot deleted']);
    }
}
