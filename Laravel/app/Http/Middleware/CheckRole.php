<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user || blank($user->role)) {
            return response()->json(['message' => __('No autorizado.')], 403);
        }

        if (! in_array($user->role, $roles, true)) {
            return response()->json(['message' => __('No tienes permiso para esta acción.')], 403);
        }

        return $next($request);
    }
}
