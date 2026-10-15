<?php

namespace Tests\Feature;

use App\Models\Education;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class EducationIsCurrentTest extends TestCase
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

    public function test_is_current_is_stored_when_sent(): void
    {
        $admin = $this->createAdmin();

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/education', [
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
            'is_current' => true,
        ]);

        $response->assertStatus(201);
        $this->assertTrue($response->json('is_current'));
        $this->assertTrue(Education::first()->is_current);
    }

    public function test_is_current_defaults_to_false_when_not_sent(): void
    {
        $admin = $this->createAdmin();

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/education', [
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
        ]);

        $response->assertStatus(201);
        $this->assertFalse(Education::first()->is_current);

        $item = $this->getJson('/api/education')->json()[0];
        $this->assertIsBool($item['is_current']);
        $this->assertFalse($item['is_current']);
    }

    public function test_is_current_is_returned_as_boolean_in_the_list(): void
    {
        Education::create([
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
            'is_current' => true,
        ]);

        $item = $this->getJson('/api/education')->json()[0];

        $this->assertArrayHasKey('is_current', $item);
        $this->assertTrue($item['is_current']);
        $this->assertIsBool($item['is_current']);
    }

    public function test_is_current_can_be_toggled_on_update(): void
    {
        $admin = $this->createAdmin();
        $education = Education::create([
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
            'is_current' => false,
        ]);

        $this->assertFalse($education->is_current);

        $response = $this->fromFrontend()->actingAs($admin)->putJson("/api/education/{$education->id}", [
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
            'is_current' => true,
        ]);

        $response->assertStatus(200);
        $this->assertTrue($education->fresh()->is_current);
    }

    public function test_invalid_is_current_is_rejected(): void
    {
        $admin = $this->createAdmin();

        $response = $this->fromFrontend()->actingAs($admin)->postJson('/api/education', [
            'title' => 'Grado',
            'institution' => 'Universidad',
            'start_date' => '2020-09-01',
            'is_current' => 'yes',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors('is_current');
        $this->assertSame(0, Education::count());
    }
}
