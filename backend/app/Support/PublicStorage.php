<?php

namespace App\Support;

class PublicStorage
{
    public static function url(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }

    public static function decodeBase64Image(string $data): string|false
    {
        $data = preg_replace('/^data:image\/\w+;base64,/', '', $data);
        $data = str_replace(' ', '+', $data);
        return base64_decode($data, true);
    }
}
