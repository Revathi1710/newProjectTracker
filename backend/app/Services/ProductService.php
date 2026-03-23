<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Create a new product with optional images.
     *
     * @param  array  $data     Validated product data
     * @param  array  $images   Array of UploadedFile instances
     * @return Product
     */
    public function create(array $data, array $images = []): Product
    {
        return DB::transaction(function () use ($data, $images) {
            // Create the product record
            // In ProductService::create(), add 'slug' to the Product::create() array:

$product = Product::create([
    'name'           => $data['name'],
    'slug'           => $data['slug'],   // ← ADD THIS LINE
    'code'           => $data['code'],
    'published_in'   => $data['published_in'] ?? null,
    'format'         => $data['format'] ?? null,
    'total_projects' => $data['total_projects'] ?? 0,
    'description'    => $data['description'] ?? null,
    'highlights'     => $data['highlights'] ?? null,
    'status'         => $data['status'],
    'price'          => $data['price'],
    'quantity'       => $data['quantity'],
]);

            // Store images
            if (!empty($images)) {
                $this->storeImages($product, $images);
            }

            return $product->load('images');
        });
    }

    /**
     * Update an existing product.
     *
     * @param  Product  $product
     * @param  array    $data
     * @param  array    $newImages       New files to add
     * @param  array    $removeImageIds  IDs of images to delete
     * @return Product
     */
    public function update(Product $product, array $data, array $newImages = [], array $removeImageIds = []): Product
    {
        return DB::transaction(function () use ($product, $data, $newImages, $removeImageIds) {
            // Update product fields
            $product->update(array_filter([
                'name'           => $data['name'] ?? null,
                  'slug'           => $data['slug'] ?? null,
                'code'           => $data['code'] ?? null,
                'published_in'   => $data['published_in'] ?? null,
                'format'         => $data['format'] ?? null,
                'total_projects' => $data['total_projects'] ?? null,
                'description'    => $data['description'] ?? null,
                'highlights'     => $data['highlights'] ?? null,
                'status'         => $data['status'] ?? null,
                'price'          => $data['price'] ?? null,
                'quantity'       => $data['quantity'] ?? null,
            ], fn($v) => !is_null($v)));

            // Remove selected images
            if (!empty($removeImageIds)) {
                $product->images()->whereIn('id', $removeImageIds)->get()->each->delete();
            }

            // Add new images
            if (!empty($newImages)) {
                $this->storeImages($product, $newImages);
            }

            return $product->fresh('images');
        });
    }

    /**
     * Soft-delete a product and clean up its images.
     */
    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            // Hard-delete images (triggers observer that removes files)
            $product->images()->get()->each->delete();
            $product->delete(); // soft delete
        });
    }

    /**
     * Store uploaded image files and create ProductImage records.
     *
     * @param  Product         $product
     * @param  UploadedFile[]  $files
     */
    private function storeImages(Product $product, array $files): void
    {
        $currentMax = $product->images()->max('sort_order') ?? -1;

        foreach ($files as $index => $file) {
            $uuid     = Str::uuid();
            $ext      = $file->getClientOriginalExtension();
            $filename = "{$uuid}.{$ext}";
            $folder   = "products/{$product->id}";

            // Save to storage/app/public/products/{id}/
            $path = $file->storeAs($folder, $filename, 'public');
            $url  = Storage::disk('public')->url($path);

            $product->images()->create([
                'filename'      => $filename,
                'original_name' => $file->getClientOriginalName(),
                'mime_type'     => $file->getMimeType(),
                'size'          => $file->getSize(),
                'path'          => $path,
                'url'           => $url,
                'sort_order'    => $currentMax + $index + 1,
            ]);
        }
    }
}