<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class OrderDownloadController extends Controller
{
    public function excel(Request $request, Order $order, Product $product): StreamedResponse
    {
        // Ensure the product was part of this order
        $itemExists = $order->items()->where('product_id', $product->id)->exists();

        abort_unless($itemExists, 403, 'This file does not belong to your order.');
        abort_unless($product->excel_path, 404, 'No file available for this product.');
        abort_unless(
            Storage::disk('public')->exists($product->excel_path),
            404,
            'File not found on server.'
        );

        $filename = $product->excel_original_name ?? ($product->name . '.xlsx');

        return Storage::disk('public')->download(
            $product->excel_path,
            $filename,
            ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        );
    }
}