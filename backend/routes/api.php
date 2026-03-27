<?php 

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\OrderDownloadController;
use App\Http\controllers\MyOrderController;
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


Route::post('logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
Route::post('/register/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/register/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/register/resend-otp', [AuthController::class, 'resendOtp']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->get('/profile', function (Request $request) {
    return $request->user();
});
Route::middleware('auth:sanctum')->group(function () {
 
    // ── My Orders ─────────────────────────────────────────────────────────
    Route::get('/my-orders', [App\Http\Controllers\MyOrderController::class, 'index']);
});
// ─── Cart Routes (outside products prefix) ────────────────────────────────────
// ⚠️ /cart/clear MUST come before /cart/{cartItem}

Route::get('/cart',             [CartController::class, 'index']);
Route::post('/cart',            [CartController::class, 'add']);
Route::put('/cart/{cartItem}',  [CartController::class, 'update']);
Route::delete('/cart/clear',    [CartController::class, 'clear']);   // clear must be before {id}
Route::delete('/cart/{cartItem}', [CartController::class, 'remove']);
 
// ── Merge requires authentication (user must be logged in to merge) ──
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/cart/merge', [CartController::class, 'merge']);
});
 
// ─── Product Routes ───────────────────────────────────────────────────────────
// ─── Product Routes ───────────────────────────────────────────────────────────
Route::prefix('products')->group(function () {
    Route::get('/',             [ProductController::class, 'index']);
    Route::post('/',            [ProductController::class, 'store']);
    Route::get('/{product}',    [ProductController::class, 'show']);     // admin — by id
    Route::put('/{product}',    [ProductController::class, 'update']);
    Route::delete('/{product}', [ProductController::class, 'destroy']);
});
    Route::get('/{product}/download-excel',      [ProductController::class, 'downloadExcel'])
         ->name('products.download-excel');
// ─── Frontend: single product by slug ────────────────────────────────────────
Route::get('/product-by-slug/{slug}', [ProductController::class, 'showBySlug']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders', [OrderController::class, 'index']);


Route::get('/orders/{order}/download/{product}', [OrderDownloadController::class, 'excel'])
    ->name('order.download.excel')
    ->middleware('signed');  // ← rejects tampered/expired URLs automatically