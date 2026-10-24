<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectImageRequest;
use App\Http\Requests\UpdateProjectImageRequest;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Services\ProjectImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Throwable;

class ProjectImageController extends Controller
{
    public const MAX_IMAGES = 10;

    public function __construct(private readonly ProjectImageService $images) {}

    public function store(StoreProjectImageRequest $request, Project $project): JsonResponse
    {
        if ($project->images()->count() >= self::MAX_IMAGES) {
            throw ValidationException::withMessages([
                'image' => __('project_images.limit', ['max' => self::MAX_IMAGES]),
            ]);
        }

        $path = $this->images->store($request->file('image'), $project->id);

        try {
            $image = DB::transaction(function () use ($project, $request, $path): ProjectImage {
                $position = ($project->images()->max('position') ?? -1) + 1;

                return $project->images()->create([
                    'path' => $path,
                    'caption' => $request->validated('caption'),
                    'position' => $position,
                ]);
            });
        } catch (Throwable $exception) {
            $this->images->delete($path);

            throw $exception;
        }

        return response()->json($image, 201);
    }

    public function update(UpdateProjectImageRequest $request, Project $project, ProjectImage $image): JsonResponse
    {
        $this->ensureBelongsToProject($project, $image);

        $image->update(['caption' => $request->validated('caption')]);

        return response()->json($image->fresh());
    }

    public function destroy(Project $project, ProjectImage $image): Response
    {
        $this->ensureBelongsToProject($project, $image);

        $path = $image->path;
        $image->delete();
        $this->images->delete($path);

        return response()->noContent();
    }

    private function ensureBelongsToProject(Project $project, ProjectImage $image): void
    {
        if ($image->project_id !== $project->id) {
            abort(404);
        }
    }
}
