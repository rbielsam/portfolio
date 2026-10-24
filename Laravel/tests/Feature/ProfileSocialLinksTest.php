<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ProfileSocialLinksTest extends TestCase
{
    use RefreshDatabase;

    private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173');
    }

    private function userWithRole(string $role): User
    {
        return User::create([
            'name' => ucfirst($role),
            'email' => $role.'@example.com',
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }

    public function test_profile_returns_social_links_as_null_by_default(): void
    {
        Profile::create(['name' => 'Test User']);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJson([
                'github_url' => null,
                'linkedin_url' => null,
            ]);
    }

    public function test_admin_can_save_social_links_and_read_them_back(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create(['name' => 'Test User']);

        $response = $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => 'https://www.linkedin.com/in/usuario',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'github_url' => 'https://github.com/usuario',
                'linkedin_url' => 'https://www.linkedin.com/in/usuario',
            ]);

        $this->assertDatabaseHas('profile', [
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => 'https://www.linkedin.com/in/usuario',
        ]);

        $this->getJson('/api/profile')
            ->assertStatus(200)
            ->assertJson([
                'github_url' => 'https://github.com/usuario',
                'linkedin_url' => 'https://www.linkedin.com/in/usuario',
            ]);
    }

    public function test_empty_social_links_are_stored_as_null(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create([
            'name' => 'Test User',
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => 'https://www.linkedin.com/in/usuario',
        ]);

        $response = $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => '',
            'linkedin_url' => '',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'github_url' => null,
                'linkedin_url' => null,
            ]);

        $this->assertDatabaseHas('profile', [
            'github_url' => null,
            'linkedin_url' => null,
        ]);
    }

    public function test_social_link_without_scheme_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'github.com/usuario',
        ])->assertStatus(422)->assertJsonValidationErrors('github_url');

        $this->assertDatabaseHas('profile', ['github_url' => null]);
    }

    public function test_social_link_with_forbidden_scheme_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'javascript:alert(1)',
            'linkedin_url' => 'data:text/html,hola',
        ])->assertStatus(422)->assertJsonValidationErrors(['github_url', 'linkedin_url']);

        $this->assertDatabaseHas('profile', [
            'github_url' => null,
            'linkedin_url' => null,
        ]);
    }

    public function test_social_link_longer_than_255_characters_is_rejected(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'https://example.com/'.str_repeat('a', 250),
        ])->assertStatus(422)->assertJsonValidationErrors('github_url');
    }

    public function test_guest_cannot_update_social_links(): void
    {
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'https://github.com/usuario',
        ])->assertStatus(401);
    }

    public function test_reader_cannot_update_social_links(): void
    {
        $reader = $this->userWithRole('reader');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($reader)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'https://github.com/usuario',
        ])->assertStatus(403);

        $this->assertDatabaseHas('profile', ['github_url' => null]);
    }

    public function test_editor_can_update_social_links(): void
    {
        $editor = $this->userWithRole('editor');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($editor)->putJson('/api/profile', [
            'name' => 'Test User',
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => 'https://www.linkedin.com/in/usuario',
        ])->assertStatus(200);

        $this->assertDatabaseHas('profile', [
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => 'https://www.linkedin.com/in/usuario',
        ]);
    }

    public function test_social_links_do_not_break_existing_profile_fields(): void
    {
        $admin = $this->userWithRole('admin');
        Profile::create(['name' => 'Test User']);

        $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'Nuevo Nombre',
            'title' => 'Desarrollador',
            'bio' => 'Biografía de prueba',
            'github_url' => 'https://github.com/usuario',
        ])->assertStatus(200);

        $this->assertDatabaseHas('profile', [
            'name' => 'Nuevo Nombre',
            'title' => 'Desarrollador',
            'bio' => 'Biografía de prueba',
            'github_url' => 'https://github.com/usuario',
            'linkedin_url' => null,
        ]);
    }
}
