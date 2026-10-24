<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Testing\TestResponse;
use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class ProjectImageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

    private function fromFrontend(): static
    {
        return $this->withHeader('Referer', 'http://localhost:5173');
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

    private function project(array $attributes = []): Project
    {
        return Project::create(array_merge([
            'title' => 'Proyecto de prueba',
            'date' => '2026-01-01',
        ], $attributes));
    }

    private function fakeImage(string $name = 'captura.jpg', Format $format = Format::JPEG): UploadedFile
    {
        $extension = match ($format) {
            Format::PNG => 'png',
            Format::WEBP => 'webp',
            default => 'jpg',
        };

        $source = tempnam(sys_get_temp_dir(), 'cap').'.'.$extension;
        Image::decodePath(__DIR__.'/fixtures/panoramica.jpg')
            ->cover(400, 300)
            ->encodeUsingFormat($format, quality: 90)
            ->save($source);

        $mime = match ($format) {
            Format::PNG => 'image/png',
            Format::WEBP => 'image/webp',
            default => 'image/jpeg',
        };

        return new UploadedFile($source, $name, $mime, null, true);
    }

    private function fakeNonImage(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'txt').'.pdf';
        file_put_contents($path, '%PDF-1.4 no soy una imagen');

        return new UploadedFile($path, 'documento.pdf', 'application/pdf', null, true);
    }

    private function upload(Project $project, User $user, array $data = []): TestResponse
    {
        return $this->fromFrontend()->actingAs($user)->post(
            "/api/projects/{$project->id}/images",
            array_merge(['image' => $this->fakeImage()], $data)
        );
    }

    // ---------- Permisos ----------

    public function test_endpoints_require_authentication(): void
    {
        $project = $this->project();
        $image = $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->postJson("/api/projects/{$project->id}/images", [
            'image' => $this->fakeImage(),
        ])->assertStatus(401);

        $this->putJson("/api/projects/{$project->id}/images/{$image->id}", [
            'caption' => 'Comentario',
        ])->assertStatus(401);

        $this->deleteJson("/api/projects/{$project->id}/images/{$image->id}")
            ->assertStatus(401);
    }

    public function test_reader_cannot_manage_images(): void
    {
        $project = $this->project();
        $reader = $this->userWithRole('reader');

        $this->upload($project, $reader)->assertStatus(403);

        $image = $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->fromFrontend()->actingAs($reader)
            ->putJson("/api/projects/{$project->id}/images/{$image->id}", ['caption' => 'x'])
            ->assertStatus(403);

        $this->fromFrontend()->actingAs($reader)
            ->deleteJson("/api/projects/{$project->id}/images/{$image->id}")
            ->assertStatus(403);
    }

    public function test_editor_can_upload_an_image(): void
    {
        $project = $this->project();
        $editor = $this->userWithRole('editor');

        $this->upload($project, $editor)->assertStatus(201);

        $this->assertDatabaseCount('project_images', 1);
    }

    // ---------- Validación ----------

    public function test_valid_upload_stores_file_and_row(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $response = $this->upload($project, $admin, ['caption' => 'Panel con datos de ejemplo']);

        $response->assertStatus(201)
            ->assertJsonPath('caption', 'Panel con datos de ejemplo')
            ->assertJsonPath('position', 0)
            ->assertJsonStructure(['id', 'caption', 'position', 'url']);

        $image = ProjectImage::first();

        $this->assertSame($project->id, $image->project_id);
        $this->assertSame(0, $image->position);
        Storage::disk('public')->assertExists($image->path);
    }

    public function test_jpg_png_and_webp_are_accepted(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        foreach ([Format::JPEG, Format::PNG, Format::WEBP] as $format) {
            $extension = match ($format) {
                Format::PNG => 'png',
                Format::WEBP => 'webp',
                default => 'jpg',
            };

            $this->fromFrontend()->actingAs($admin)->post(
                "/api/projects/{$project->id}/images",
                ['image' => $this->fakeImage('captura.'.$extension, $format)]
            )->assertStatus(201);
        }

        $this->assertDatabaseCount('project_images', 3);
    }

    public function test_non_image_file_is_rejected(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->fromFrontend()->actingAs($admin)->post(
            "/api/projects/{$project->id}/images",
            ['image' => $this->fakeNonImage()]
        )->assertStatus(422)->assertJsonValidationErrors(['image']);
    }

    public function test_missing_file_is_rejected(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->fromFrontend()->actingAs($admin)
            ->post("/api/projects/{$project->id}/images", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_oversized_image_is_rejected(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $file = UploadedFile::fake()->create('enorme.jpg', 6000, 'image/jpeg');

        $this->fromFrontend()->actingAs($admin)->post(
            "/api/projects/{$project->id}/images",
            ['image' => $file]
        )->assertStatus(422)->assertJsonValidationErrors(['image']);
    }

    public function test_caption_is_optional(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201)->assertJsonPath('caption', null);
    }

    public function test_caption_is_limited_to_500_characters(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin, ['caption' => str_repeat('a', 501)])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['caption']);
    }

    public function test_image_can_be_updated_without_uploading_again(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');
        $image = $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->fromFrontend()->actingAs($admin)
            ->putJson("/api/projects/{$project->id}/images/{$image->id}", [
                'caption' => 'Comentario actualizado',
            ])
            ->assertOk()
            ->assertJsonPath('caption', 'Comentario actualizado');

        $this->assertDatabaseHas('project_images', [
            'id' => $image->id,
            'caption' => 'Comentario actualizado',
        ]);
    }

    public function test_empty_caption_is_stored_as_null(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');
        $image = $project->images()->create([
            'path' => 'projects/1/a.jpg',
            'caption' => 'Anterior',
            'position' => 0,
        ]);

        $this->fromFrontend()->actingAs($admin)
            ->putJson("/api/projects/{$project->id}/images/{$image->id}", ['caption' => '   '])
            ->assertOk()
            ->assertJsonPath('caption', null);
    }

    public function test_updated_caption_is_limited_to_500_characters(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');
        $image = $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->fromFrontend()->actingAs($admin)
            ->putJson("/api/projects/{$project->id}/images/{$image->id}", [
                'caption' => str_repeat('a', 501),
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['caption']);
    }

    // ---------- Orden y portada ----------

    public function test_images_are_returned_in_upload_order(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);
        $this->upload($project, $admin)->assertStatus(201);

        $images = $this->getJson('/api/projects')->json()[0]['images'];

        $this->assertCount(2, $images);
        $this->assertSame([0, 1], array_column($images, 'position'));
    }

    public function test_cover_url_is_the_first_image_and_passes_to_the_next_on_delete(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);
        $this->upload($project, $admin)->assertStatus(201);

        $images = $project->images()->get();
        $firstUrl = $images[0]->url;
        $secondUrl = $images[1]->url;

        $this->getJson('/api/projects')
            ->assertJsonPath('0.cover_url', $firstUrl);

        $this->fromFrontend()->actingAs($admin)
            ->deleteJson("/api/projects/{$project->id}/images/{$images[0]->id}")
            ->assertNoContent();

        $this->getJson('/api/projects')
            ->assertJsonPath('0.cover_url', $secondUrl);
    }

    public function test_legacy_image_is_used_as_cover_when_there_is_no_gallery(): void
    {
        $this->project(['image' => 'projects/legacy.jpg']);

        $response = $this->getJson('/api/projects');

        $this->assertStringContainsString('projects/legacy.jpg', $response->json()[0]['cover_url']);
    }

    public function test_absolute_legacy_image_is_kept_as_cover(): void
    {
        $this->project(['image' => 'https://otro.example/captura.jpg']);

        $this->getJson('/api/projects')
            ->assertJsonPath('0.cover_url', 'https://otro.example/captura.jpg');
    }

    public function test_project_without_images_has_null_cover(): void
    {
        $this->project();

        $this->getJson('/api/projects')
            ->assertJsonPath('0.cover_url', null);
    }

    // ---------- Borrado ----------

    public function test_image_from_another_project_returns_not_found(): void
    {
        $project = $this->project();
        $other = $this->project(['title' => 'Otro']);
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);
        $image = $project->images()->first();

        $this->fromFrontend()->actingAs($admin)
            ->putJson("/api/projects/{$other->id}/images/{$image->id}", ['caption' => 'x'])
            ->assertNotFound();

        $this->fromFrontend()->actingAs($admin)
            ->deleteJson("/api/projects/{$other->id}/images/{$image->id}")
            ->assertNotFound();
    }

    public function test_deleting_an_image_removes_row_and_file(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);
        $image = $project->images()->first();
        $path = $image->path;

        $this->fromFrontend()->actingAs($admin)
            ->deleteJson("/api/projects/{$project->id}/images/{$image->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('project_images', ['id' => $image->id]);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_deleting_a_project_removes_its_images_and_files(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);
        $this->upload($project, $admin)->assertStatus(201);

        $paths = $project->images()->pluck('path')->all();

        $this->fromFrontend()->actingAs($admin)
            ->deleteJson("/api/projects/{$project->id}")
            ->assertOk();

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseCount('project_images', 0);

        foreach ($paths as $path) {
            Storage::disk('public')->assertMissing($path);
        }
    }

    public function test_deleting_a_project_removes_the_legacy_image(): void
    {
        $project = $this->project(['image' => 'projects/legacy.jpg']);
        $admin = $this->userWithRole('admin');

        Storage::disk('public')->put('projects/legacy.jpg', 'contenido');

        $this->fromFrontend()->actingAs($admin)
            ->deleteJson("/api/projects/{$project->id}")
            ->assertOk();

        Storage::disk('public')->assertMissing('projects/legacy.jpg');
    }

    // ---------- Límites y privacidad ----------

    public function test_eleventh_image_is_rejected(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        for ($i = 0; $i < 10; $i++) {
            $project->images()->create([
                'path' => "projects/{$project->id}/{$i}.jpg",
                'position' => $i,
            ]);
        }

        $this->upload($project, $admin)
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);

        $this->assertDatabaseCount('project_images', 10);
    }

    public function test_public_json_does_not_expose_internal_paths(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');

        $this->upload($project, $admin)->assertStatus(201);

        $image = $this->getJson('/api/projects')->json()[0]['images'][0];

        $this->assertArrayNotHasKey('path', $image);
        $this->assertArrayNotHasKey('project_id', $image);
        $this->assertArrayHasKey('url', $image);
    }

    public function test_url_uses_the_configured_disk(): void
    {
        config([
            'filesystems.photo_disk' => 's3',
            'filesystems.disks.s3.url' => 'https://cdn.example.test',
            'filesystems.disks.s3.region' => 'eu-south-2',
            'filesystems.disks.s3.bucket' => 'bucket-prueba',
        ]);

        $project = $this->project();
        $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->getJson('/api/projects')
            ->assertJsonPath('0.cover_url', 'https://cdn.example.test/projects/1/a.jpg')
            ->assertJsonPath('0.images.0.url', 'https://cdn.example.test/projects/1/a.jpg');
    }

    public function test_project_responses_keep_the_gallery_after_saving(): void
    {
        $project = $this->project();
        $admin = $this->userWithRole('admin');
        $project->images()->create(['path' => 'projects/1/a.jpg', 'position' => 0]);

        $this->fromFrontend()->actingAs($admin)
            ->putJson("/api/projects/{$project->id}", ['title' => 'Título nuevo'])
            ->assertOk()
            ->assertJsonCount(1, 'images');
    }
}
