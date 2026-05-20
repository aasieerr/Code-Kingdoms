<?php

namespace App\Support;

use App\Models\User;

class UserPresenter
{
    public static function present(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar_url' => $user->avatar_path ? PublicStorage::url($user->avatar_path) : null,
            'is_admin' => (bool) $user->is_admin,
        ];
    }
}
