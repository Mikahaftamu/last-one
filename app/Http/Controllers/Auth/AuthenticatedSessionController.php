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

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        // Only show login page if user is not authenticated
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->roles->first()) {
                $role = $user->roles->first()->role;
                return match($role) {
                    'admin' => Inertia::location(route('admin.dashboard')),
                    'vp' => Inertia::location(route('vp.dashboard')),
                    'director' => Inertia::location(route('director.dashboard')),
                    'coordinator' => Inertia::location(route('coordinator.dashboard')),
                    'worker' => Inertia::location(route('worker.dashboard')),
                    default => Inertia::location(route('dashboard')),
                };
            }
        }

        // Always render the login page for non-authenticated users
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'errors' => session('errors'),
            'intended' => session('url.intended'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        try {
            // Check for too many login attempts
            if ($this->hasTooManyLoginAttempts($request)) {
                $this->fireLockoutEvent($request);
                return $this->sendLockoutResponse($request);
            }

            // Attempt to authenticate the user
            $request->authenticate();

            // Regenerate the session
            $request->session()->regenerate();

            // Get the authenticated user
            $user = Auth::user();

            // Check if user has a role
            if (!$user->roles->first()) {
                Auth::logout();
                Log::warning('Login attempt failed: User has no role assigned', ['user_id' => $user->id]);
                throw ValidationException::withMessages([
                    'email' => 'Your account is not properly configured. Please contact support.',
                ]);
            }

            // Get user's role
            $role = $user->roles->first()->role;

            // Log successful login
            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'role' => $role,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);

            // Clear login attempts
            $this->clearLoginAttempts($request);

            // Redirect based on role
            return match($role) {
                'admin' => redirect()->intended(route('admin.dashboard')),
                'vp' => redirect()->intended(route('vp.dashboard')),
                'director' => redirect()->intended(route('director.dashboard')),
                'coordinator' => redirect()->intended(route('coordinator.dashboard')),
                'worker' => redirect()->intended(route('worker.dashboard')),
                default => redirect()->intended(route('dashboard')),
            };
        } catch (ValidationException $e) {
            // Increment login attempts
            $this->incrementLoginAttempts($request);

            // Log failed login attempt
            Log::warning('Login attempt failed: Invalid credentials', [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            throw $e;
        } catch (\Exception $e) {
            // Log unexpected errors
            Log::error('Login error: ' . $e->getMessage(), [
                'email' => $request->email,
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'exception' => $e
            ]);
            return back()->withErrors([
                'email' => 'An unexpected error occurred. Please try again later.',
            ]);
        }
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        try {
            // Get user info before logout for logging
            $user = Auth::user();
            $userId = $user ? $user->id : null;
            $role = $user && $user->roles->first() ? $user->roles->first()->role : null;

            // Logout the user
            Auth::guard('web')->logout();

            // Invalidate the session
            $request->session()->invalidate();

            // Regenerate the CSRF token
            $request->session()->regenerateToken();

            // Log successful logout
            if ($userId) {
                Log::info('User logged out successfully', [
                    'user_id' => $userId,
                    'role' => $role,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
            }

            // Redirect to login page with success message
            return redirect()->route('login')->with('status', 'You have been successfully logged out.');
        } catch (\Exception $e) {
            // Log logout error
            Log::error('Logout error: ' . $e->getMessage(), [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'exception' => $e
            ]);
            
            // Still try to redirect to login page
            return redirect()->route('login')->withErrors([
                'error' => 'An error occurred during logout. Please try again.',
            ]);
        }
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
