<?php

namespace Tests\Feature;

use App\Models\Education;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiReadTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_returns_json(): void
    {
        Profile::create(['name' => 'Test User', 'title' => 'Developer']);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200)
            ->assertJson(['name' => 'Test User', 'title' => 'Developer']);
    }

    public function test_education_ordered_by_most_recent(): void
    {
        Education::create([
            'title' => 'Old Degree',
            'institution' => 'University A',
            'start_date' => '2010-01-01',
        ]);
        Education::create([
            'title' => 'Recent Degree',
            'institution' => 'University B',
            'start_date' => '2020-06-01',
        ]);

        $response = $this->getJson('/api/education');

        $response->assertStatus(200);
        $titles = collect($response->json())->pluck('title')->all();
        $this->assertSame(['Recent Degree', 'Old Degree'], $titles);
    }

    public function test_experience_ordered_by_most_recent(): void
    {
        Experience::create([
            'position' => 'Junior',
            'company' => 'Company A',
            'start_date' => '2018-01-01',
        ]);
        Experience::create([
            'position' => 'Senior',
            'company' => 'Company B',
            'start_date' => '2022-01-01',
        ]);

        $response = $this->getJson('/api/experience');

        $response->assertStatus(200);
        $positions = collect($response->json())->pluck('position')->all();
        $this->assertSame(['Senior', 'Junior'], $positions);
    }

    public function test_projects_ordered_by_most_recent(): void
    {
        Project::create([
            'title' => 'Old Project',
            'date' => '2019-01-01',
        ]);
        Project::create([
            'title' => 'Recent Project',
            'date' => '2023-01-01',
        ]);

        $response = $this->getJson('/api/projects');

        $response->assertStatus(200);
        $titles = collect($response->json())->pluck('title')->all();
        $this->assertSame(['Recent Project', 'Old Project'], $titles);
    }

    public function test_contact_is_not_public(): void
    {
        $response = $this->getJson('/api/contact');

        $response->assertStatus(401);
    }

    public function test_empty_sections_return_empty_array(): void
    {
        $response = $this->getJson('/api/education');

        $response->assertStatus(200)
            ->assertJson([]);
    }
}
