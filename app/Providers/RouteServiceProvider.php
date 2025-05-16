<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * The path to your application's "home" route.
     *
     * Typically, users are redirected here after authentication.
     *
     * @var string
     */
    public const HOME = '/';

    /**
     * Define your route model bindings, pattern filters, and other route configuration.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        $this->routes(function () {
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });

        // Override the default redirect path based on user role
        $this->app->singleton('redirect.after.login', function () {
            if (Auth::check() && Auth::user()->roles->first()) {
                $role = Auth::user()->roles->first()->role;
                return match($role) {
                    'admin' => route('admin.dashboard'),
                    'vp' => route('vp.dashboard'),
                    'director' => route('director.dashboard'),
                    'coordinator' => route('coordinator.dashboard'),
                    'worker' => route('worker.dashboard'),
                    default => self::HOME,
                };
            }
            return self::HOME;
        });
    }
} 