<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class MyOrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Use Auth::user() or $request->user()
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 401);
        }

        $orders = Order::with(['items.product.images'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }
}