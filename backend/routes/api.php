<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminAuthController;
// Controllers
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderDownloadController;
use App\Http\Controllers\MyOrderController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ExcelUploadController;
// ─────────────────────────────────────────────────────────
// Authenticated User
// ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/upload-projects', [ExcelUploadController::class, 'uploadExcel']);
// ─────────────────────────────────────────────────────────
// Auth Routes
// ─────────────────────────────────────────────────────────
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/register/resend-otp', [AuthController::class, 'resendOtp']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', fn (Request $request) => $request->user());
    Route::get('/my-orders', [MyOrderController::class, 'index']);
        Route::get('/user/profile', [AuthController::class, 'getProfile']);
    Route::post('/user/update', [AuthController::class, 'updateProfile']);
});

// ─────────────────────────────────────────────────────────
// Cart Routes
// ─────────────────────────────────────────────────────────
Route::get('/cart',               [CartController::class, 'index']);
Route::post('/cart',              [CartController::class, 'add']);
Route::put('/cart/{cartItem}',    [CartController::class, 'update']);
Route::delete('/cart/clear',      [CartController::class, 'clear']);
Route::delete('/cart/{cartItem}', [CartController::class, 'remove']);

Route::middleware('auth:sanctum')->post('/cart/merge', [CartController::class, 'merge']);

// ─────────────────────────────────────────────────────────
// Product Routes
// ─────────────────────────────────────────────────────────
Route::get('/product-by-slug/{slug}', [ProductController::class, 'showBySlug']);

Route::prefix('products')->group(function () {
    Route::get('/',             [ProductController::class, 'index']);
    Route::post('/',            [ProductController::class, 'store']);
    Route::get('/{product}',    [ProductController::class, 'show']);
    Route::put('/{product}',    [ProductController::class, 'update']);
    Route::delete('/{product}', [ProductController::class, 'destroy']);
    Route::get('/{product}/download-excel', [ProductController::class, 'downloadExcel'])
        ->name('products.download-excel');
});

// ─────────────────────────────────────────────────────────
// Orders
// ─────────────────────────────────────────────────────────

    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders',  [OrderController::class, 'index']);


Route::get('/orders/{order}/download/{product}', [OrderDownloadController::class, 'excel'])
    ->name('order.download.excel')
    ->middleware('signed');

// ─────────────────────────────────────────────────────────
// Blog Routes
// ⚠️  IMPORTANT: slug route MUST come BEFORE /{blog} wildcard
// ─────────────────────────────────────────────────────────
Route::prefix('blogs')->group(function () {
    Route::get('/slug/{slug}', [BlogController::class, 'showBySlug']); // ← FIRST
    Route::get('/',            [BlogController::class, 'index']);
    Route::post('/',           [BlogController::class, 'store']);
    Route::get('/{blog}',      [BlogController::class, 'show']);
    Route::put('/{blog}',      [BlogController::class, 'update']);
    Route::delete('/{blog}',   [BlogController::class, 'destroy']);
});



// Login
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/admin/change-password', [AdminAuthController::class, 'changePassword']);

});
Route::get('/all-users', [AuthController::class, 'allUsers']);
// List all PDFs
Route::get('/pdf-files', function() {
    $files = \App\Models\PdfFile::latest()->get()->map(function($f) {
        return [
            'id'         => $f->id,
            'filename'   => $f->filename,
            'created_at' => $f->created_at->format('d M Y h:i A'),
        ];
    });
    return response()->json($files);
});

// Download/View a PDF by ID
Route::get('/pdf-files/{id}/download', function($id) {
    $pdfFile = \App\Models\PdfFile::findOrFail($id);
    $pdfContent = base64_decode($pdfFile->pdf_base64);

    return response($pdfContent, 200, [
        'Content-Type'        => 'application/pdf',
        'Content-Disposition' => 'inline; filename="' . $pdfFile->filename . '"',
    ]);
});