<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    public function index()
    {
        return Experience::query()
            ->orderByDesc('start_date')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'position' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_current' => ['nullable', 'boolean'],
        ]);

        $experience = Experience::create($validated);

        return response()->json($experience, 201);
    }

    public function update(Request $request, $id)
    {
        $experience = Experience::findOrFail($id);

        $validated = $request->validate([
            'position' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date'],
            'description' => ['nullable', 'string'],
            'is_current' => ['nullable', 'boolean'],
        ]);

        $experience->update($validated);

        return response()->json($experience);
    }

    public function destroy($id)
    {
        $experience = Experience::findOrFail($id);
        $experience->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
