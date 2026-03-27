<?php

namespace App\Traits;

use App\Models\Cart;
use Illuminate\Http\Request;

trait ResolvesCart
{
    protected function getOrCreateCart(Request $request): Cart
    {
        // ── Authenticated user (Bearer token via Sanctum) ──
        if ($request->user()) {
            return Cart::firstOrCreate(['user_id' => $request->user()->id]);
        }

        // ── Guest user: must send X-Session-Id header ──
        $sessionId = $request->header('X-Session-Id');

        if (!$sessionId) {
            abort(400, 'No session ID provided');
        }

        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    protected function cartSummary(Cart $cart): array
    {
        $cart->load('items.product.images');

        return [
            'data'  => $cart->items,
            'total' => $cart->items->sum(
                fn($item) => $item->quantity * ($item->product->active_price ?? $item->product->price)
            ),
            'count' => $cart->items->sum('quantity'),
        ];
    }
}