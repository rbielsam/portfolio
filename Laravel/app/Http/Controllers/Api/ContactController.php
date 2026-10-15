<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index()
    {
        return Contact::query()
            ->orderBy('id')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:255'],
        ]);

        $contact = Contact::create($validated);

        return response()->json($contact, 201);
    }

    public function update(Request $request, $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'type' => ['required', 'string', 'max:255'],
            'value' => ['required', 'string', 'max:255'],
        ]);

        $contact->update($validated);

        return response()->json($contact);
    }

    public function destroy($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
