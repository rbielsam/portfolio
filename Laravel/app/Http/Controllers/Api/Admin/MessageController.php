<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::query()
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($messages);
    }

    public function markAsRead($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->is_read = true;
        $message->save();

        return response()->json($message);
    }

    public function destroy($id)
    {
        $message = ContactMessage::findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Mensaje eliminado']);
    }
}
