<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Services\ProjectImageService;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function __construct(private readonly ProjectImageService $images) {}

    public function index()
    {
        return Project::query()
            ->with('images')
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

        return response()->json($project->load('images'), 201);
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

        return response()->json($project->load('images'));
    }

    public function destroy($id)
    {
        $project = Project::findOrFail($id);

        $paths = $project->images()->pluck('path')->all();
        $legacyImage = $project->image;

        $project->delete();

        foreach ($paths as $path) {
            $this->images->delete($path);
        }

        $this->images->delete($legacyImage);

        return response()->json(['message' => 'Deleted']);
    }
}
