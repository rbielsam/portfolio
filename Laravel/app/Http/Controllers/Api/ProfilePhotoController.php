<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadProfilePhotoRequest;
use App\Models\Profile;
use App\Services\ProfilePhotoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfilePhotoController extends Controller
{
    public function __construct(private readonly ProfilePhotoService $photos)
    {
    }

    public function store(UploadProfilePhotoRequest $request): JsonResponse
    {
        $profile = Profile::first();

        if ($profile?->photo) {
            return $this->replace($profile);
        }

        $path = $this->photos->store($request->file('image'));

        if (! $profile) {
            $profile = Profile::create(['name' => 'Portfolio']);
        }

        $profile->update(['photo' => $path]);

        return response()->json($profile->fresh(), 201);
    }

    public function update(UploadProfilePhotoRequest $request): JsonResponse
    {
        return $this->replace(Profile::first());
    }

    public function destroy(Request $request): JsonResponse
    {
        $profile = Profile::first();

        $this->photos->delete($profile?->photo);

        if ($profile) {
            $profile->update(['photo' => null]);
        }

        return response()->json(['message' => 'Foto eliminada']);
    }

    private function replace(?Profile $profile): JsonResponse
    {
        $request = request();
        $path = $this->photos->replace(
            $profile?->photo,
            $request->file('image')
        );

        if (! $profile) {
            $profile = Profile::create(['name' => 'Portfolio', 'photo' => $path]);
        } else {
            $profile->update(['photo' => $path]);
        }

        return response()->json($profile->fresh());
    }
}
