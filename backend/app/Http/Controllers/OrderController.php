<?php

namespace App\Http\Controllers;

use App\Jobs\SendOrderExcelMail;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrderController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_payment_id'   => 'required|string',
            'shipping'              => 'required|array',
            'shipping.firstName'    => 'required|string',
            'shipping.lastName'     => 'required|string',
            'shipping.email'        => 'required|email',
            'shipping.mobile'       => 'required|string',
            'shipping.country'      => 'required|string',
            'shipping.city'         => 'required|string',
            'shipping.pincode'      => 'required|string',
            'items'                 => 'required|array|min:1',
            'items.*.product_id'    => 'required|exists:products,id',
            'items.*.quantity'      => 'required|integer|min:1',
            'items.*.price'         => 'required|numeric|min:0',
            'subtotal'              => 'required|numeric',
            'tax'                   => 'required|numeric',
            'total'                 => 'required|numeric',
        ]);

        $shipping = $request->shipping;

        // ── ✅ FIX: Manually resolve user from sanctum guard ──────────────
        // Works for both guests (returns null) and logged-in users (returns user).
        // No middleware required on the route — just a plain Route::post('/orders').
        $userId = Auth::guard('sanctum')->id(); // null for guests, user id for logged-in

        $order = Order::create([
            'user_id'             => $userId,   // ✅ now correctly set
            'razorpay_payment_id' => $request->razorpay_payment_id,
            'customer_name'       => trim($shipping['firstName'] . ' ' . $shipping['lastName']),
            'customer_email'      => $shipping['email'],
            'customer_mobile'     => $shipping['mobile'],
            'country'             => $shipping['country'],
            'state'               => $shipping['state']   ?? null,
            'city'                => $shipping['city'],
            'pincode'             => $shipping['pincode'],
            'address'             => $shipping['address'] ?? null,
            'subtotal'            => $request->subtotal,
            'tax'                 => $request->tax,
            'total'               => $request->total,
            'status'              => 'paid',
        ]);

        foreach ($request->items as $item) {
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity'   => $item['quantity'],
                'price'      => $item['price'],
            ]);
        }

        SendOrderExcelMail::dispatch($order);

        return response()->json([
            'message'  => 'Order placed successfully.',
            'order_id' => $order->id,
        ], 201);
    }
 public function index(Request $request): JsonResponse
{
    $status = $request->query('status');

    $query = Order::with(['items.product.images'])->latest();

    // Filter by status if provided
    if ($status && $status !== 'all') {
        $query->where('status', $status);
    }

    // Paginate results (10 per page)
    $orders = $query->paginate(10);

    return response()->json([
        'success' => true,
        'data' => $orders->items(),
        'meta' => [
            'current_page' => $orders->currentPage(),
            'last_page' => $orders->lastPage(),
            'total' => $orders->total(),
            'per_page' => $orders->perPage(),
        ]
    ]);
}
}