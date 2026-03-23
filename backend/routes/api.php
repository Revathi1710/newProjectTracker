<?php 

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\CartController;

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
// ─── Cart Routes (outside products prefix) ────────────────────────────────────
// ⚠️ /cart/clear MUST come before /cart/{cartItem}
Route::delete('/cart/clear',       [CartController::class, 'clear']);
Route::get('/cart',                [CartController::class, 'index']);
Route::post('/cart',               [CartController::class, 'add']);
 
Route::delete('/cart/{cartItem}',  [CartController::class, 'remove']);

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

// ─── Frontend: single product by slug ────────────────────────────────────────
Route::get('/product-by-slug/{slug}', [ProductController::class, 'showBySlug']);