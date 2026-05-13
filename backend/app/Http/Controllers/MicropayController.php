<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MicropayController extends Controller
{
    private const PACKAGES = [
        'starter' => ['coins' => 100],
        'pro' => ['coins' => 275],
        'legend' => ['coins' => 750],
    ];

    /**
     * Acredita CodeCoins al elegir un pack (sin pasarela de pago; pensado para desarrollo / demo).
     */
    public function claimCodeCoinsPack(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package' => 'required|string|in:starter,pro,legend',
        ]);

        $package = $validated['package'];
        $coins = self::PACKAGES[$package]['coins'];
        $user = $request->user();

        $ref = 'direct:' . Str::uuid()->toString();

        DB::transaction(function () use ($ref, $user, $package, $coins) {
            DB::table('micropay_transactions')->insert([
                'user_id' => $user->id,
                'stripe_session_id' => $ref,
                'package' => $package,
                'code_coins_credited' => $coins,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $user->increment('code_coins', $coins);
        });

        $user->refresh();

        return response()->json([
            'message' => sprintf('Se han añadido %d CodeCoins a tu cuenta.', $coins),
            'package' => $package,
            'credited_code_coins' => $coins,
            'code_coins_balance' => (int) $user->code_coins,
        ]);
    }
}
