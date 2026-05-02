<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Character;
use App\Models\Screenshot;
use App\Models\Item;
use Illuminate\Http\Request;

class StatsController extends Controller
{
    public function index()
    {
        return response()->json([
            'users' => User::count(),
            'characters' => Character::count(),
            'screenshots' => Screenshot::count(),
            'items' => Item::count(),
        ]);
    }
}
