<?php

namespace App\Http\Middleware;

use App\Providers\RouteServiceProvider;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();
                
                // If user has no role, redirect to home
                if (!$user->roles->first()) {
                    return redirect(RouteServiceProvider::HOME);
                }

                // Get user's role and redirect accordingly
                $role = $user->roles->first()->role;
                return match($role) {
                    'admin' => redirect()->route('admin.dashboard'),
                    'vp' => redirect()->route('vp.dashboard'),
                    'director' => redirect()->route('director.dashboard'),
                    'coordinator' => redirect()->route('coordinator.dashboard'),
                    'worker' => redirect()->route('worker.dashboard'),
                    default => redirect(RouteServiceProvider::HOME),
                };
            }
        }

        return $next($request);
    }
} 