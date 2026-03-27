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
     * Create a new product with optional images and an optional Excel file.
     *
     * @param  array  $data     Validated product data
     * @param  array  $images   Array of UploadedFile instances (product images)
     * @param  UploadedFile|null  $excelFile  Optional Excel / CSV file
     * @return Product
     */
    public function create(array $data, array $images = [], ?UploadedFile $excelFile = null): Product
    {
        return DB::transaction(function () use ($data, $images, $excelFile) {

            $product = Product::create([
                'name'           => $data['name'],
                'slug'           => $data['slug'],
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

            // Store product images
            if (!empty($images)) {
                $this->storeImages($product, $images);
            }

            // Store Excel file
            if ($excelFile) {
                $this->storeExcelFile($product, $excelFile);
            }

            return $product->load('images');
        });
    }

    /**
     * Update an existing product.
     *
     * @param  Product           $product
     * @param  array             $data
     * @param  array             $newImages        New image files to add
     * @param  array             $removeImageIds   IDs of images to delete
     * @param  UploadedFile|null $excelFile        New Excel file to replace existing
     * @param  bool              $removeExcel      Whether to delete the existing Excel file
     * @return Product
     */
    public function update(
        Product $product,
        array $data,
        array $newImages = [],
        array $removeImageIds = [],
        ?UploadedFile $excelFile = null,
        bool $removeExcel = false
    ): Product {
        return DB::transaction(function () use ($product, $data, $newImages, $removeImageIds, $excelFile, $removeExcel) {

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

            // Handle Excel: delete existing if removing or replacing
            if ($removeExcel || $excelFile) {
                $this->deleteExcelFile($product);
            }

            // Store new Excel file
            if ($excelFile) {
                $this->storeExcelFile($product, $excelFile);
            }

            return $product->fresh('images');
        });
    }

    /**
     * Soft-delete a product and clean up its images and Excel file.
     */
    public function delete(Product $product): void
    {
        DB::transaction(function () use ($product) {
            $product->images()->get()->each->delete();
            $this->deleteExcelFile($product);
            $product->delete();
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

    /**
     * Store the Excel/CSV file and save its metadata to the product record.
     * The file goes to storage/app/public/products/{id}/excel/
     *
     * Columns used on the products table:
     *   excel_filename      VARCHAR  — stored UUID filename
     *   excel_original_name VARCHAR  — original upload name shown to users
     *   excel_path          VARCHAR  — relative storage path
     *   excel_size          BIGINT   — file size in bytes
     *   excel_mime          VARCHAR  — MIME type
     */
    private function storeExcelFile(Product $product, UploadedFile $file): void
    {
        $uuid     = Str::uuid();
        $ext      = $file->getClientOriginalExtension();
        $filename = "{$uuid}.{$ext}";
        $folder   = "products/{$product->id}/excel";

        $path = $file->storeAs($folder, $filename, 'public');

        // Save metadata back onto the product row
        $product->update([
            'excel_filename'      => $filename,
            'excel_original_name' => $file->getClientOriginalName(),
            'excel_path'          => $path,
            'excel_size'          => $file->getSize(),
            'excel_mime'          => $file->getMimeType(),
        ]);
    }

    /**
     * Delete the Excel file from disk and clear the product's excel columns.
     */
    private function deleteExcelFile(Product $product): void
    {
        if ($product->excel_path && Storage::disk('public')->exists($product->excel_path)) {
            Storage::disk('public')->delete($product->excel_path);
        }

        $product->update([
            'excel_filename'      => null,
            'excel_original_name' => null,
            'excel_path'          => null,
            'excel_size'          => null,
            'excel_mime'          => null,
        ]);
    }
}