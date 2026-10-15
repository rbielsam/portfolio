<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class CheckRoleMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Route::middleware(['auth:sanctum', 'role:admin'])->get('/test/admin-only', fn () => response()->json(['ok' => true]));
        Route::middleware(['auth:sanctum', 'role:admin,editor'])->get('/test/content', fn () => response()->json(['ok' => true]));
        Route::middleware(['auth:sanctum', 'role:admin,editor,reader'])->get('/test/read', fn () => response()->json(['ok' => true]));
    }

    private function userWithRole(string $role): User
    {
        return User::create([
            'name' => 'User '.$role,
            'email' => $role.'@example.com',
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }

    public function test_admin_passes_admin_only_route(): void
    {
        $this->actingAs($this->userWithRole('admin'))
            ->getJson('/test/admin-only')
            ->assertStatus(200);
    }

    public function test_editor_is_rejected_from_admin_only_route(): void
    {
        $this->actingAs($this->userWithRole('editor'))
            ->getJson('/test/admin-only')
            ->assertStatus(403);
    }

    public function test_reader_is_rejected_from_admin_only_route(): void
    {
        $this->actingAs($this->userWithRole('reader'))
            ->getJson('/test/admin-only')
            ->assertStatus(403);
    }

    public function test_editor_passes_content_route(): void
    {
        $this->actingAs($this->userWithRole('editor'))
            ->getJson('/test/content')
            ->assertStatus(200);
    }

    public function test_reader_is_rejected_from_content_route(): void
    {
        $this->actingAs($this->userWithRole('reader'))
            ->getJson('/test/content')
            ->assertStatus(403);
    }

    public function test_reader_passes_read_route(): void
    {
        $this->actingAs($this->userWithRole('reader'))
            ->getJson('/test/read')
            ->assertStatus(200);
    }

    public function test_guest_is_rejected_from_all_routes(): void
    {
        $this->getJson('/test/admin-only')->assertStatus(401);
        $this->getJson('/test/content')->assertStatus(401);
        $this->getJson('/test/read')->assertStatus(401);
    }

    public function test_user_without_role_is_rejected(): void
    {
        $user = User::create([
            'name' => 'Sin rol',
            'email' => 'sinrol@example.com',
            'password' => Hash::make('password'),
        ]);
        $user->role = null;
        $user->save();

        $this->actingAs($user)
            ->getJson('/test/read')
            ->assertStatus(403);
    }
}
