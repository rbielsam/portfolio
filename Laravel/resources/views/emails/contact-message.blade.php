<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="UTF-8">
    <title>{{ __('Nuevo mensaje de contacto') }}</title>
</head>
<body style="font-family: Arial, Helvetica, sans-serif; color: #333;">
    <h2 style="color: #1a3a5c;">{{ __('Nuevo mensaje desde el portfolio') }}</h2>

    <table cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-bottom: 16px;">
        <tr>
            <td style="border: 1px solid #ddd;"><strong>{{ __('Nombre') }}</strong></td>
            <td style="border: 1px solid #ddd;">{{ $contactMessage->name }}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd;"><strong>{{ __('Email') }}</strong></td>
            <td style="border: 1px solid #ddd;">{{ $contactMessage->email }}</td>
        </tr>
        <tr>
            <td style="border: 1px solid #ddd;"><strong>{{ __('Fecha') }}</strong></td>
            <td style="border: 1px solid #ddd;">{{ $contactMessage->created_at?->format('d/m/Y H:i') ?? __('Sin fecha') }}</td>
        </tr>
    </table>

    <h3 style="color: #1a3a5c;">{{ __('Mensaje') }}</h3>
    <p style="white-space: pre-wrap; background: #f5f5f5; padding: 12px; border-left: 3px solid #1a3a5c;">
        {{ $contactMessage->message }}
    </p>

    <p style="margin-top: 24px; color: #666; font-size: 12px;">
        {{ __('Responde directamente a este correo para ponerte en contacto con :name.', ['name' => $contactMessage->name]) }}
    </p>
</body>
</html>
