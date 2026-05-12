<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MicropayController extends Controller
{
    private const PACKAGES = [
        'starter' => ['coins' => 100, 'price_cents' => 99],
        'pro' => ['coins' => 275, 'price_cents' => 199],
        'legend' => ['coins' => 750, 'price_cents' => 499],
    ];

    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'package' => 'required|string|in:starter,pro,legend',
            'return_path' => 'required|string|starts_with:/',
        ]);

        $selected = self::PACKAGES[$validated['package']];
        $user = $request->user();
        $stripeSecret = config('services.stripe.secret');
        $frontendUrl = rtrim(config('services.stripe.frontend_url'), '/');

        if (!$stripeSecret || !$frontendUrl) {
            return response()->json([
                'message' => 'Stripe no está configurado en el servidor.',
            ], 500);
        }

        $successUrl = sprintf(
            '%s%s?micropay_status=success&session_id={CHECKOUT_SESSION_ID}',
            $frontendUrl,
            $validated['return_path']
        );
        $cancelUrl = sprintf(
            '%s%s?micropay_status=cancel',
            $frontendUrl,
            $validated['return_path']
        );

        $response = Http::withToken($stripeSecret)
            ->asForm()
            ->post('https://api.stripe.com/v1/checkout/sessions', [
                'mode' => 'payment',
                'payment_method_types[]' => 'card',
                'line_items[0][quantity]' => 1,
                'line_items[0][price_data][currency]' => 'eur',
                'line_items[0][price_data][unit_amount]' => $selected['price_cents'],
                'line_items[0][price_data][product_data][name]' => sprintf(
                    'CodeCoins Pack %s (%d coins)',
                    strtoupper($validated['package']),
                    $selected['coins']
                ),
                'metadata[user_id]' => (string) $user->id,
                'metadata[package]' => $validated['package'],
                'metadata[coins]' => (string) $selected['coins'],
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ]);

        if ($response->failed()) {
            return response()->json([
                'message' => 'No se pudo crear la sesión de pago en Stripe.',
                'details' => $response->json(),
            ], 502);
        }

        return response()->json([
            'checkout_url' => $response->json('url'),
            'session_id' => $response->json('id'),
        ]);
    }

    public function confirmCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'session_id' => 'required|string',
        ]);

        $stripeSecret = config('services.stripe.secret');
        if (!$stripeSecret) {
            return response()->json(['message' => 'Stripe no está configurado.'], 500);
        }

        $sessionId = $validated['session_id'];
        $user = $request->user();

        $existing = DB::table('micropay_transactions')
            ->where('stripe_session_id', $sessionId)
            ->first();
        if ($existing) {
            return response()->json([
                'message' => 'Pago ya confirmado anteriormente.',
                'credited_code_coins' => (int) $existing->code_coins_credited,
                'code_coins_balance' => (int) $user->fresh()->code_coins,
            ]);
        }

        $response = Http::withToken($stripeSecret)
            ->get("https://api.stripe.com/v1/checkout/sessions/{$sessionId}");
        if ($response->failed()) {
            return response()->json([
                'message' => 'No se pudo verificar la sesión en Stripe.',
            ], 502);
        }

        $session = $response->json();
        $paymentStatus = $session['payment_status'] ?? null;
        $paidUserId = (int) ($session['metadata']['user_id'] ?? 0);
        $package = $session['metadata']['package'] ?? null;

        if ($paymentStatus !== 'paid') {
            return response()->json(['message' => 'El pago no está completado todavía.'], 409);
        }
        if ($paidUserId !== (int) $user->id) {
            return response()->json(['message' => 'La sesión de pago no pertenece a este usuario.'], 403);
        }
        if (!isset(self::PACKAGES[$package])) {
            return response()->json(['message' => 'Pack inválido en metadata de Stripe.'], 422);
        }

        $coins = self::PACKAGES[$package]['coins'];
        DB::transaction(function () use ($sessionId, $user, $package, $coins) {
            DB::table('micropay_transactions')->insert([
                'user_id' => $user->id,
                'stripe_session_id' => $sessionId,
                'package' => $package,
                'code_coins_credited' => $coins,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $user->increment('code_coins', $coins);
        });

        $user->refresh();

        return response()->json([
            'message' => 'Pago confirmado y CodeCoins acreditadas.',
            'package' => $package,
            'credited_code_coins' => $coins,
            'code_coins_balance' => $user->code_coins,
        ]);
    }
}
