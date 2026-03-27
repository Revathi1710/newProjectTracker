<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Services\ProductService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function __construct(protected ProductService $service)
    {
    }

    // ─────────────────────────────────────────────
    // GET /api/products
    // ─────────────────────────────────────────────
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with('images');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $sortBy  = in_array($request->sort_by, ['name', 'price', 'quantity', 'created_at']) ? $request->sort_by : 'created_at';
        $sortDir = $request->sort_dir === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $products = $query->paginate($request->get('per_page', 15));

        return ProductResource::collection($products);
    }

    // ─────────────────────────────────────────────
    // POST /api/products
    // ─────────────────────────────────────────────
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->service->create(
            $request->validated(),
            $request->file('images', []),
            $request->file('excel_file')   // null if not uploaded
        );

        return response()->json([
            'message' => 'Product created successfully.',
            'data'    => new ProductResource($product),
        ], 201);
    }

    // ─────────────────────────────────────────────
    // GET /api/products/{product}
    // ─────────────────────────────────────────────
    public function show(Product $product): JsonResponse
    {
        $product->load('images');

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/product-by-slug/{slug}
    // ─────────────────────────────────────────────
    public function showBySlug(string $slug): JsonResponse
    {
        $product = Product::with('images')
            ->where('slug', $slug)
            ->where('status', 'active')
            ->firstOrFail();

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    // ─────────────────────────────────────────────
    // PUT /api/products/{product}
    // ─────────────────────────────────────────────
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $updated = $this->service->update(
            $product,
            $request->validated(),
            $request->file('images', []),
            $request->input('remove_images', []),
            $request->file('excel_file'),                          // null if not sent
            (bool) $request->input('remove_excel', false)         // explicit delete flag
        );

        return response()->json([
            'message' => 'Product updated successfully.',
            'data'    => new ProductResource($updated),
        ]);
    }

    // ─────────────────────────────────────────────
    // DELETE /api/products/{product}
    // ─────────────────────────────────────────────
    public function destroy(Product $product): JsonResponse
    {
        $this->service->delete($product);

        return response()->json([
            'message' => 'Product deleted successfully.',
        ]);
    }

    // ─────────────────────────────────────────────
    // GET /api/products/{product}/download-excel
    // Stream the Excel file as a download
    // ─────────────────────────────────────────────
    public function downloadExcel(Product $product): \Symfony\Component\HttpFoundation\StreamedResponse|JsonResponse
    {
        if (!$product->excel_path || !Storage::disk('public')->exists($product->excel_path)) {
            return response()->json(['message' => 'No Excel file found for this product.'], 404);
        }

        return Storage::disk('public')->download(
            $product->excel_path,
            $product->excel_original_name ?? $product->excel_filename
        );
    }
}