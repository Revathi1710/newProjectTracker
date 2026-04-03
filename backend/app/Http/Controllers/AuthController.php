<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use App\Models\Order; // ✅ ADD THIS LINE
class AuthController extends Controller
{
    // SEND OTP
   public function sendOtp(Request $request)
{
    $request->validate([
        'name' => 'required',
        'email' => 'required|email', // Remove 'unique' here
        'mobile_number' => 'required',
        'password' => 'required|min:8|confirmed'
    ]);

    // Check if a VERIFIED user already exists with this email
    $existingVerifiedUser = User::where('email', $request->email)
                                ->where('is_verified', 1)
                                ->first();

    if ($existingVerifiedUser) {
        return response()->json([
            'message' => 'This email is already registered and verified.'
        ], 422);
    }

    $otp = (string) rand(100000, 999999);

    // updateOrCreate will now overwrite the data for the unverified user 
    // or create a new one if it doesn't exist at all.
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
// ✅ GET ALL USERS (ADMIN)
public function allUsers(Request $request)
    {
        $perPage = 10;
        $search  = $request->query('search');
 
        $query = User::where('is_verified', 1)->latest();
 
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('mobile_number', 'like', "%{$search}%");
            });
        }
 
        $users = $query->paginate($perPage);
 
        // Attach order count to each user
        $users->getCollection()->transform(function ($user) {
            $user->order_count = Order::where('user_id', $user->id)->count();
            $user->total_spent = Order::where('user_id', $user->id)
                                      ->where('status', 'paid')
                                      ->sum('total');
            return $user;
        });
 
        return response()->json([
            'message' => 'Users fetched successfully',
            'data'    => $users->items(),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'total'        => $users->total(),
                'per_page'     => $users->perPage(),
            ]
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
// ✅ GET AUTHENTICATED USER DATA
public function getProfile(Request $request)
{
    // Returns the currently logged-in user (from the Sanctum token)
    return response()->json([
        'user' => $request->user()
    ]);
}

// ✅ UPDATE PROFILE & CHANGE PASSWORD
public function updateProfile(Request $request)
{
    $user = $request->user();

    $request->validate([
        'name' => 'sometimes|required|string|max:255',
        'mobile_number' => 'sometimes|required|string|max:15',
        'current_password' => 'required_with:new_password',
        'new_password' => 'nullable|min:8',
    ]);

    // Handle Name/Phone Updates
    if ($request->has('name')) $user->name = $request->name;
    if ($request->has('mobile_number')) $user->mobile_number = $request->mobile_number;

    // Handle Password Change
    if ($request->filled('new_password')) {
        // Check if old password matches
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password does not match our records.'], 400);
        }
        $user->password = Hash::make($request->new_password);
    }

    $user->save();

    return response()->json([
        'message' => 'Profile updated successfully',
        'user' => $user
    ]);
}
}