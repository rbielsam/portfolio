<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function index()
    {
        return response()->json(Profile::first() ?? new Profile());
    }

    public function update(Request $request)
    {
        $profile = Profile::first();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'photo' => ['nullable', 'string', 'max:255'],
        ]);

        if (!$profile) {
            $profile = Profile::create($validated);
            return response()->json($profile, 201);
        }

        $profile->update($validated);

        return response()->json($profile);
    }
}
