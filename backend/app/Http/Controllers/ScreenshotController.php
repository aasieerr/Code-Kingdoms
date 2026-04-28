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
                $screenshot->image_url = asset('storage/' . $screenshot->image_path);
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
        $image = str_replace('data:image/png;base64,', '', $image);
        $image = str_replace(' ', '+', $image);
        $imageName = Str::random(10) . '_' . time() . '.png';

        Storage::disk('public')->put('screenshots/' . $imageName, base64_decode($image));

        $screenshot = Screenshot::create([
            'user_id' => $request->user()->id,
            'image_path' => 'screenshots/' . $imageName,
        ]);

        return response()->json([
            'message' => 'Screenshot saved successfully',
            'screenshot' => $screenshot
        ], 201);
    }
}
