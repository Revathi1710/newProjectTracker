<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
    // SEND OTP
   public function sendOtp(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users,email',
        'mobile_number' => 'required',
        'password' => 'required|min:8|confirmed'
    ]);

    $otp = (string) rand(100000, 999999);

    $user = User::updateOrCreate(
        ['email' => $request->email],
        [
            'name' => $request->name,
            'mobile_number' => $request->mobile_number,
            'password' => Hash::make($request->password),
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10),
            'is_verified' => 0
        ]
    );

    \Log::info("OTP for {$request->email}: $otp");

    Mail::raw("Your OTP is: $otp", function ($message) use ($request) {
        $message->to($request->email)
                ->subject('Your OTP Code');
    });

    return response()->json(['message' => 'OTP sent successfully']);
}

    // VERIFY OTP
   public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if (trim($user->otp) !== trim($request->otp)) {
        return response()->json(['message' => 'Invalid OTP'], 400);
    }

    if (now()->gt($user->otp_expires_at)) {
        return response()->json(['message' => 'OTP expired'], 400);
    }

    // ✅ Verify user
    $user->otp = null;
    $user->otp_expires_at = null;
    $user->is_verified = 1;
    $user->save();

    // 🔥 Auto login (token)
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Account created successfully',
        'token' => $token,
        'user' => $user
    ]);
}

    // RESEND OTP
   public function resendOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    $otp = (string) rand(100000, 999999);

    $user->otp = $otp;
    $user->otp_expires_at = now()->addMinutes(10);
    $user->save();

    Mail::raw("Your new OTP is: $otp", function ($message) use ($request) {
        $message->to($request->email)
                ->subject('Resend OTP');
    });

    return response()->json(['message' => 'OTP resent successfully']);
}
    // ✅ LOGIN
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required'
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if (!Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid password'], 400);
    }

    if (!$user->is_verified) {
        return response()->json([
            'message' => 'Please verify your account using OTP before login'
        ], 403);
    }

    // 🔥 Delete old tokens
    $user->tokens()->delete();

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'token' => $token,
        'user' => $user
    ]);
}
// ✅ LOGOUT
public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out successfully'
    ]);
}
}