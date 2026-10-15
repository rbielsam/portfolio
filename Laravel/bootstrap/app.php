<?php

use App\Http\Middleware\CheckRole;
use App\Http\Middleware\SetLocale;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

$estadoDe = static function (Throwable $e): int {
    return $e instanceof HttpExceptionInterface ? $e->getStatusCode() : 500;
};

$mensajeDe = static function (Throwable $e, Request $request): string {
    if ($e instanceof MethodNotAllowedHttpException) {
        return __('The :method method is not supported for route :path. Supported methods: :methods.', [
            'method' => $request->method(),
            'path' => $request->path(),
            'methods' => $e->getHeaders()['Allow'] ?? '',
        ]);
    }

    // El enrutador construye este mensaje con sprintf y sin clave de traducción.
    if ($e instanceof NotFoundHttpException && preg_match(
        '/^The route (.+) could not be found\.$/',
        $e->getMessage(),
        $coincidencia,
    )) {
        return __('The route :path could not be found.', ['path' => $coincidencia[1]]);
    }

    $mensaje = $e->getMessage();

    if (! filled($mensaje)) {
        $mensaje = $e instanceof HttpExceptionInterface && $e->getStatusCode() === 404
            ? 'Not Found.'
            : 'An error occurred while processing your request.';
    }

    // Cualquier literal del propio framework que tenga traducción en lang/*.json
    // sale traducida; el resto de mensajes pasan sin cambios.
    return __($mensaje);
};

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withCommands()
    ->withMiddleware(function (Middleware $middleware): void {
        // Global para que también rija en peticiones que no coinciden con ninguna ruta.
        $middleware->append(SetLocale::class);

        $middleware->api(
            prepend: [
                EnsureFrontendRequestsAreStateful::class,
            ],
        );

        $middleware->alias([
            'role' => CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) use ($estadoDe, $mensajeDe): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) use ($estadoDe, $mensajeDe) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($e instanceof AuthenticationException) {
                return response()->json(['message' => __('Unauthenticated.')], 401);
            }

            // Estas excepciones ya construyen su propia respuesta JSON limpia.
            if ($e instanceof ValidationException || $e instanceof HttpResponseException) {
                return null;
            }

            return response()->json(
                ['message' => $mensajeDe($e, $request)],
                $estadoDe($e),
            );
        });
    })->create();
