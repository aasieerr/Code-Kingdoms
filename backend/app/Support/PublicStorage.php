<?php

namespace App\Support;

class PublicStorage
{
    public static function url(string $path): string
    {
        return '/storage/'.ltrim($path, '/');
    }
}
