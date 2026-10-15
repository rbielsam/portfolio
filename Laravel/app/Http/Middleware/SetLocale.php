<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const COOKIE = 'lang';

    public const DEFAULT = 'es';

    public const SUPPORTED = ['es', 'ca', 'en'];

    public function handle(Request $request, Closure $next): Response
    {
        App::setLocale($this->idiomaSolicitado($request));

        return $next($request);
    }

    /**
     * El idioma llega en una cookie de sesión compartida con la SPA, sin cifrar.
     */
    private function idiomaSolicitado(Request $request): string
    {
        $idioma = $request->cookies->get(self::COOKIE) ?? $this->cookieEnBruto($request, self::COOKIE);

        return in_array($idioma, self::SUPPORTED, true) ? $idioma : self::DEFAULT;
    }

    private function cookieEnBruto(Request $request, string $nombre): ?string
    {
        $cabecera = (string) $request->headers->get('Cookie', '');

        if (! str_contains($cabecera, $nombre.'=')) {
            return null;
        }

        $pares = array_map(
            fn (string $par): array => explode('=', $par, 2),
            explode('; ', $cabecera),
        );

        foreach ($pares as $par) {
            if ($par[0] === $nombre) {
                return $par[1] ?? null;
            }
        }

        return null;
    }
}
