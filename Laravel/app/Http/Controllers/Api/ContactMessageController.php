<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactMessageMail;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactMessageController extends Controller
{
    public function store(Request $request)
    {
        if ($this->isBot($request)) {
            return response()->json(['message' => __('Mensaje enviado.')]);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'message' => ['required', 'string', 'max:'.config('contact.message_max', 5000)],
        ]);

        $contactMessage = ContactMessage::create($validated);

        $this->sendNotification($contactMessage);

        return response()->json(['message' => __('Mensaje enviado. Te responderé pronto.')], 201);
    }

    private function isBot(Request $request): bool
    {
        return trim((string) $request->input('website', '')) !== '';
    }

    private function sendNotification(ContactMessage $contactMessage): void
    {
        $adminEmail = config('contact.admin_email');

        if (! $adminEmail) {
            return;
        }

        try {
            Mail::to($adminEmail)
                ->locale(App::getLocale())
                ->send(new ContactMessageMail($contactMessage));
        } catch (\Throwable $e) {
            Log::error('No se pudo enviar el aviso de contacto', [
                'contact_message_id' => $contactMessage->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
