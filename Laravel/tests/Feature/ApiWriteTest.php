<?php

namespace Tests\Feature;

use App\Models\Education;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ApiWriteTest extends TestCase
{
    use RefreshDatabase;

    private function createAdmin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);
    }
    private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173');
    }


    public function test_write_requires_authentication(): void
    {
        $response = $this->postJson('/api/education', [
            'title' => 'Degree',
            'institution' => 'University',
            'start_date' => '2020-01-01',
        ]);

        $response->assertStatus(401);
    }

    public function test_admin_can_create_education(): void
    {
        $admin = $this->createAdmin();

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/education', [
            'title' => 'Degree',
            'institution' => 'University',
            'start_date' => '2020-01-01',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('education', ['title' => 'Degree']);
    }

    public function test_validation_rejects_invalid_data(): void
    {
        $admin = $this->createAdmin();

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/education', [
            'title' => '',
            'institution' => '',
            'start_date' => 'not-a-date',
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_update_education(): void
    {
        $admin = $this->createAdmin();
        $education = Education::create([
            'title' => 'Old',
            'institution' => 'University',
            'start_date' => '2010-01-01',
        ]);

        $response = $this->fromFrontend()->actingAs($admin)->putJson("/api/education/{$education->id}", [
            'title' => 'Updated',
            'institution' => 'University',
            'start_date' => '2010-01-01',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('education', ['title' => 'Updated']);
    }

    public function test_admin_can_delete_education(): void
    {
        $admin = $this->createAdmin();
        $education = Education::create([
            'title' => 'ToDelete',
            'institution' => 'University',
            'start_date' => '2010-01-01',
        ]);

        $response = $this->fromFrontend()->actingAs($admin)->deleteJson("/api/education/{$education->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('education', ['id' => $education->id]);
    }

    public function test_contact_is_not_public_but_admin_can_manage(): void
    {
        $admin = $this->createAdmin();

        $this->getJson('/api/contact')->assertStatus(401);
        $this->postJson('/api/contact', [
            'type' => 'email',
            'value' => 'a@b.com',
        ])->assertStatus(401);

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/contact', [
            'type' => 'email',
            'value' => 'a@b.com',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('contact', ['value' => 'a@b.com']);
    }

    public function test_admin_can_update_profile(): void
    {
        $admin = $this->createAdmin();
        Profile::create(['name' => 'Initial']);

        $response = $this->fromFrontend()->actingAs($admin)->putJson('/api/profile', [
            'name' => 'New Name',
            'title' => 'Developer',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('profile', ['name' => 'New Name']);
    }
}
