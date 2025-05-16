<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string  $role The required role name
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if user is authenticated
        if (!Auth::check()) {
            Log::warning('Unauthenticated access attempt to role-protected route', [
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            return redirect()->route('login');
        }

        // Get user's role
        $user = Auth::user();
        $userRole = $user->roles->first();
        
        // Check if user has a role
        if (!$userRole) {
            Auth::logout();
            Log::warning('User with no role attempted to access protected route', [
                'user_id' => Auth::id(),
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            return redirect()->route('login')->withErrors([
                'email' => 'Your account is not properly configured. Please contact support.',
            ]);
        }

        // Check if user has the required role
        if ($userRole->role !== $role) {
            Log::warning('User attempted to access unauthorized route', [
                'user_id' => Auth::id(),
                'user_role' => $userRole->role,
                'required_role' => $role,
                'route' => $request->route()->getName(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent()
            ]);
            return redirect()->route('login')->withErrors([
                'email' => 'You do not have permission to access this area.',
            ]);
        }

        // Log successful role check
        Log::info('User accessed role-protected route', [
            'user_id' => Auth::id(),
            'role' => $role,
            'route' => $request->route()->getName(),
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return $next($request);
    }
} 