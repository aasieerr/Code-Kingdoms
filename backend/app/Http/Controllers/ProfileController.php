<?php

namespace App\Http\Controllers;

use App\Support\UserPresenter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Perfil actualizado.',
            'user' => UserPresenter::present($user->fresh()),
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'La contraseña actual no es correcta.',
                'errors' => [
                    'current_password' => ['La contraseña actual no es correcta.'],
                ],
            ], 422);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json([
            'message' => 'Contraseña actualizada.',
        ]);
    }

    public function storeAvatar(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'image' => 'required|string',
        ]);

        $image = preg_replace('/^data:image\/\w+;base64,/', '', $request->input('image'));
        $image = str_replace(' ', '+', $image);
        $decoded = base64_decode($image, true);

        if ($decoded === false) {
            return response()->json(['message' => 'La imagen no es válida.'], 422);
        }

        if (strlen($decoded) > 2 * 1024 * 1024) {
            return response()->json(['message' => 'La imagen supera el límite de 2 MB.'], 422);
        }

        Storage::disk('public')->makeDirectory('avatars');

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $path = 'avatars/'.$user->id.'_'.Str::random(8).'_'.time().'.png';
        Storage::disk('public')->put($path, $decoded);
        $user->update(['avatar_path' => $path]);

        return response()->json([
            'message' => 'Foto de perfil actualizada.',
            'user' => UserPresenter::present($user->fresh()),
        ]);
    }

    public function destroyAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar_path && Storage::disk('public')->exists($user->avatar_path)) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->update(['avatar_path' => null]);

        return response()->json([
            'message' => 'Foto de perfil eliminada.',
            'user' => UserPresenter::present($user->fresh()),
        ]);
    }

    public function notifications(Request $request)
    {
        return response()->json([
            'notifications' => $request->user()->notifications()->take(30)->get(),
            'unread_count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    public function markNotificationsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'Notificaciones marcadas como leídas.',
        ]);
    }
}
