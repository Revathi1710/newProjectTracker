<?php
namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Traits\ResolvesCart;
use Illuminate\Http\Request;

class CartController extends Controller {
    use ResolvesCart;

    // GET /cart
    public function index(Request $request) {
        $cart = $this->getOrCreateCart($request);
        return response()->json($this->cartSummary($cart));
    }

    // POST /cart
    public function add(Request $request) {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'integer|min:1',
        ]);

        $cart = $this->getOrCreateCart($request);

        $item = $cart->items()->firstOrCreate(
            ['product_id' => $request->product_id],
            ['quantity'   => 0]
        );
        $item->increment('quantity', $request->quantity ?? 1);
        $item->load('product.images');

        return response()->json(['data' => $item], 201);
    }

    // PUT /cart/{id}
    public function update(Request $request, CartItem $cartItem) {
        $request->validate(['quantity' => 'required|integer|min:0']);

        if ($request->quantity === 0) {
            $cartItem->delete();
        } else {
            $cartItem->update(['quantity' => $request->quantity]);
        }

        return response()->json(['message' => 'Updated']);
    }

    // DELETE /cart/{id}
    public function remove(CartItem $cartItem) {
        $cartItem->delete();
        return response()->json(['message' => 'Removed']);
    }

    // DELETE /cart/clear
    public function clear(Request $request) {
        $cart = $this->getOrCreateCart($request);
        $cart->items()->delete();
        return response()->json(['message' => 'Cart cleared']);
    }

    // POST /cart/merge  (called after login)
    public function merge(Request $request) {
        $request->validate(['session_id' => 'required|string']);

        $userCart  = \App\Models\Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $guestCart = \App\Models\Cart::where('session_id', $request->session_id)->first();

        if ($guestCart) {
            foreach ($guestCart->items as $guestItem) {
                $existing = $userCart->items()
                    ->where('product_id', $guestItem->product_id)->first();

                if ($existing) {
                    $existing->increment('quantity', $guestItem->quantity);
                } else {
                    $userCart->items()->create([
                        'product_id' => $guestItem->product_id,
                        'quantity'   => $guestItem->quantity,
                    ]);
                }
            }
            $guestCart->delete();
        }

        return response()->json($this->cartSummary($userCart));
    }
}