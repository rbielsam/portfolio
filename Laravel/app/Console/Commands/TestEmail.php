<?php

namespace App\Console\Commands;

use App\Mail\ContactMessageMail;
use App\Models\ContactMessage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class TestEmail extends Command
{
    protected $signature = 'portfolio:test-email';

    protected $description = 'Envía un email de prueba a la dirección de avisos (ADMIN_EMAIL)';

    public function handle(): int
    {
        $adminEmail = config('contact.admin_email');

        if (! $adminEmail) {
            $this->error('No hay dirección de aviso configurada. Define ADMIN_EMAIL en tu .env');
            $this->line('  Transporte actual: '.$this->currentTransport());

            return Command::FAILURE;
        }

        $this->line('Enviando email de prueba a: <info>'.$adminEmail.'</info>');
        $this->line('Transporte: <info>'.config('mail.default').'</info>');

        if (config('mail.default') === 'resend' && ! config('services.resend.key')) {
            $this->error('Falta la clave de Resend. Define RESEND_API_KEY en tu .env');

            return Command::FAILURE;
        }

        $testMessage = new ContactMessage([
            'name' => 'Prueba de configuración',
            'email' => $adminEmail,
            'message' => 'Este es un email de prueba del formulario de contacto del portfolio.'
                .' Si lo has recibido, el envío está correctamente configurado.',
        ]);
        $testMessage->created_at = now();

        try {
            Mail::to($adminEmail)->send(new ContactMessageMail($testMessage));
        } catch (\Throwable $e) {
            $this->error('No se ha podido enviar el email: '.$e->getMessage());
            $this->line($this->hint());

            return Command::FAILURE;
        }

        $this->info('Email de prueba enviado correctamente.');

        return Command::SUCCESS;
    }

    private function hint(): string
    {
        return match (config('mail.default')) {
            'resend' => '  Revisa RESEND_API_KEY y MAIL_FROM_ADDRESS en tu .env'
                .' (el remitente debe ser un dominio verificado en resend.com).',
            'smtp' => '  Revisa las variables MAIL_* de tu .env (servidor, puerto y credenciales).',
            'log' => '  El transporte log solo escribe en storage/logs/laravel.log, no envía.',
            default => '  Revisa la configuración de MAIL en tu .env.',
        };
    }

    private function currentTransport(): string
    {
        return match (config('mail.default')) {
            'log' => 'log (se escribe en storage/logs/laravel.log, no se envía)',
            'array' => 'array (los emails se descartan)',
            default => config('mail.default'),
        };
    }
}
