<?php

namespace Tests\Feature;

use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DateFormatTest extends TestCase
{
    use RefreshDatabase;

    public function test_education_dates_are_serialized_as_month_and_year(): void
    {
        Education::create([
            'title' => 'Grado en Informática',
            'institution' => 'Universidad',
            'start_date' => '2018-09-01',
            'end_date' => '2022-06-15',
        ]);

        $item = $this->getJson('/api/education')->json()[0];

        $this->assertSame('2018-09', $item['start_date']);
        $this->assertSame('2022-06', $item['end_date']);
    }

    public function test_experience_dates_are_serialized_as_month_and_year(): void
    {
        Experience::create([
            'position' => 'Desarrollador',
            'company' => 'Empresa',
            'start_date' => '2025-07-03',
            'end_date' => '2026-04-06',
        ]);

        $item = $this->getJson('/api/experience')->json()[0];

        $this->assertSame('2025-07', $item['start_date']);
        $this->assertSame('2026-04', $item['end_date']);
    }

    public function test_project_date_is_serialized_as_month_and_year(): void
    {
        Project::create([
            'title' => 'Proyecto',
            'date' => '2019-01-25',
        ]);

        $item = $this->getJson('/api/projects')->json()[0];

        $this->assertSame('2019-01', $item['date']);
    }

    public function test_optional_dates_stay_null(): void
    {
        Experience::create([
            'position' => 'Desarrollador',
            'company' => 'Empresa',
            'start_date' => '2025-07-03',
        ]);
        Project::create(['title' => 'Proyecto']);

        $experience = $this->getJson('/api/experience')->json()[0];
        $project = $this->getJson('/api/projects')->json()[0];

        $this->assertArrayHasKey('end_date', $experience);
        $this->assertNull($experience['end_date']);

        $this->assertArrayHasKey('date', $project);
        $this->assertNull($project['date']);
    }

    public function test_created_at_keeps_its_original_format(): void
    {
        Experience::create([
            'position' => 'Desarrollador',
            'company' => 'Empresa',
            'start_date' => '2025-07-03',
        ]);

        $item = $this->getJson('/api/experience')->json()[0];

        $this->assertMatchesRegularExpression(
            '/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/',
            $item['created_at']
        );
    }

    public function test_month_and_year_input_is_stored_as_a_full_date(): void
    {
        $education = new Education(['start_date' => '2024-09']);
        $experience = new Experience(['start_date' => '2024-09', 'end_date' => '2025-06']);
        $project = new Project(['title' => 'Proyecto', 'date' => '2019-01']);

        $this->assertStringStartsWith('2024-09-01', $education->getAttributes()['start_date']);
        $this->assertStringStartsWith('2024-09-01', $experience->getAttributes()['start_date']);
        $this->assertStringStartsWith('2025-06-01', $experience->getAttributes()['end_date']);
        $this->assertStringStartsWith('2019-01-01', $project->getAttributes()['date']);
    }
}
