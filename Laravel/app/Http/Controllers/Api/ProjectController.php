<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::query()
            ->orderByDesc('date')
            ->orderByDesc('created_at')
            ->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'url' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'technologies' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
        ]);

        $project = Project::create($validated);

        return response()->json($project, 201);
    }

    public function update(Request $request, $id)
    {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'url' => ['nullable', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:255'],
            'technologies' => ['nullable', 'string'],
            'date' => ['nullable', 'date'],
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);
        $project->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
