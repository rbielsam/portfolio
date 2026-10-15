<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Education;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    public function index()
    {
        return Education::query()
            ->orderByDesc('start_date')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_current' => ['nullable', 'boolean'],
        ]);

        $education = Education::create($validated);

        return response()->json($education, 201);
    }

    public function update(Request $request, $id)
    {
        $education = Education::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'institution' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_current' => ['nullable', 'boolean'],
        ]);

        $education->update($validated);

        return response()->json($education);
    }

    public function destroy($id)
    {
        $education = Education::findOrFail($id);
        $education->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
