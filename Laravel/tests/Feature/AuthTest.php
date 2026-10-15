<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173')
            ->withHeader('Origin', 'http://localhost:5173');
    }

    public function test_login_with_valid_credentials_returns_user_and_sets_session(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->fromFrontend()->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['user'])
            ->assertJsonPath('user.email', 'admin@example.com');

        $this->assertAuthenticated();
    }

    public function test_login_does_not_expose_token_in_payload(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->fromFrontend()->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);

        $response->assertJsonMissingPath('token');
    }

    public function test_login_with_invalid_password_returns_401(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->fromFrontend()->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    public function test_login_with_unknown_email_returns_401(): void
    {
        $response = $this->fromFrontend()->postJson('/api/login', [
            'email' => 'unknown@example.com',
            'password' => 'password',
        ]);

        $response->assertStatus(401);
        $this->assertGuest();
    }

    public function test_user_endpoint_requires_authentication(): void
    {
        $response = $this->fromFrontend()->getJson('/api/user');

        $response->assertStatus(401);
    }

    public function test_user_endpoint_returns_authenticated_user(): void
    {
        $user = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $response = $this->fromFrontend()->actingAs($user)->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJsonPath('email', 'admin@example.com');
    }

    public function test_logout_ends_the_session(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
        ]);

        $this->fromFrontend()->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertStatus(200);

        $this->fromFrontend()->getJson('/api/user')->assertStatus(200);

        $this->fromFrontend()->postJson('/api/logout')->assertStatus(200);

        $this->assertFalse(
            $this->app['session.store']->has(\Illuminate\Support\Facades\Auth::guard('web')->getName())
        );
    }
}
