<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use App\Providers\RouteServiceProvider;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     * 
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function create()
    {
        // If user is already authenticated, redirect to their dashboard
        if (Auth::check()) {
            $user = Auth::user();
            
            // Check if user has a role
            if ($user->roles->isEmpty()) {
                Auth::logout();
                return redirect()->route('login')->withErrors([
                    'email' => 'Your account is not properly configured. Please contact support.',
                ]);
            }
            
            // Get the user's primary role
            $role = $user->roles->first()->role;
            
            // Redirect based on role
            return match($role) {
                'admin' => redirect()->route('admin.dashboard'),
                'vp' => redirect()->route('vp.dashboard'),
                'director' => redirect()->route('director.dashboard'),
                'coordinator' => redirect()->route('coordinator.dashboard'),
                'worker' => redirect()->route('worker.dashboard'),
                default => redirect(RouteServiceProvider::HOME),
            };
        }

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();
        
        // Check if user has a role
        if ($user->roles->isEmpty()) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
            
            return redirect()->route('login')->withErrors([
                'email' => 'Your account is not properly configured. Please contact support.',
            ]);
        }
        
        // Get the user's primary role
        $role = $user->roles->first()->role;
        
        // Redirect based on role
        return match($role) {
            'admin' => redirect()->intended(route('admin.dashboard')),
            'vp' => redirect()->intended(route('vp.dashboard')),
            'director' => redirect()->intended(route('director.dashboard')),
            'coordinator' => redirect()->intended(route('coordinator.dashboard')),
            'worker' => redirect()->intended(route('worker.dashboard')),
            default => redirect()->intended(RouteServiceProvider::HOME),
        };
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Check if the user has too many login attempts.
     */
    protected function hasTooManyLoginAttempts(Request $request): bool
    {
        return RateLimiter::tooManyAttempts(
            $this->throttleKey($request), 5 // 5 attempts
        );
    }

    /**
     * Increment the login attempts for the user.
     */
    protected function incrementLoginAttempts(Request $request): void
    {
        RateLimiter::hit(
            $this->throttleKey($request),
            60 // 1 minute decay
        );
    }

    /**
     * Clear the login attempts for the user.
     */
    protected function clearLoginAttempts(Request $request): void
    {
        RateLimiter::clear($this->throttleKey($request));
    }

    /**
     * Fire the lockout event.
     */
    protected function fireLockoutEvent(Request $request): void
    {
        event(new Lockout($request));
    }

    /**
     * Get the lockout response for the request.
     */
    protected function sendLockoutResponse(Request $request): RedirectResponse
    {
        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the throttle key for the request.
     */
    protected function throttleKey(Request $request): string
    {
        return mb_strtolower($request->input('email')) . '|' . $request->ip();
    }
}
