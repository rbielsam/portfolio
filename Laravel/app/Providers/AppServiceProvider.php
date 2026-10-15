<?php

namespace App\Providers;

use App\Http\Middleware\CheckRole;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('contact-messages', function (Request $request) {
            return Limit::perMinutes(
                config('contact.throttle.decay_minutes', 5),
                config('contact.throttle.max_attempts', 3)
            )->by($request->ip());
        });
    }
}
