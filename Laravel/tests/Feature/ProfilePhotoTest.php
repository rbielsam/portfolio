<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfilePhotoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
    }

        private function fromFrontend()
    {
        return $this->withHeader('Referer', 'http://localhost:5173');
    }

private function admin(): User
    {
        return User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
                    'role' => 'admin',
        ]);
    }

    private function fakeImage(string $name = 'foto.jpg', string $mime = 'image/jpeg', int $kb = 100): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'fak').'.jpg';
        imagejpeg(imagecreatetruecolor(200, 200), $path);

        return new UploadedFile(
            $path,
            $name,
            $mime,
            null,
            true
        );
    }

    private function fakeNonImage(string $name = 'documento.pdf'): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'txt').'.pdf';
        file_put_contents($path, '%PDF-1.4 no soy una imagen');

        return new UploadedFile($path, $name, 'application/pdf', null, true);
    }

    private function fakeOversizedImage(): UploadedFile
    {
        $path = tempnam(sys_get_temp_dir(), 'big').'.jpg';

        $width = 2000;
        $height = 2000;
        $image = imagecreatetruecolor($width, $height);

        for ($x = 0; $x < $width; $x += 2) {
            for ($y = 0; $y < $height; $y += 2) {
                $color = imagecolorallocate($image, random_int(0, 255), random_int(0, 255), random_int(0, 255));
                imagefilledrectangle($image, $x, $y, $x + 1, $y + 1, $color);
            }
        }

        imagejpeg($image, $path, 100);
        imagedestroy($image);

        return new UploadedFile($path, 'enorme.jpg', 'image/jpeg', null, true);
    }

    // ---------- Permisos ----------

    public function test_endpoints_require_authentication(): void
    {
        $file = $this->fakeImage();

        $this->postJson('/api/profile/photo', ['image' => $file])->assertStatus(401);
        $this->putJson('/api/profile/photo', ['image' => $file])->assertStatus(401);
        $this->deleteJson('/api/profile/photo')->assertStatus(401);
    }

    // ---------- Validacion ----------

    public function test_valid_image_is_accepted(): void
    {
        $admin = $this->admin();

        $response = $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage()]);

        $response->assertStatus(201);
    }

    public function test_png_and_webp_are_accepted(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage('a.png', 'image/png')])
            ->assertStatus(201);

        $this->fromFrontend()->actingAs($admin)
            ->put('/api/profile/photo', ['image' => $this->fakeImage('b.webp', 'image/webp')])
            ->assertStatus(200);
    }

    public function test_non_image_file_is_rejected(): void
    {
        $admin = $this->admin();

        $response = $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeNonImage()]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['image']);
    }

    public function test_missing_file_is_rejected(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_oversized_image_is_rejected(): void
    {
        $admin = $this->admin();
        $file = $this->fakeOversizedImage();

        $this->assertGreaterThan(
            2 * 1024 * 1024,
            $file->getSize(),
            'La imagen de prueba deberia pesar mas de 2 MB'
        );

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $file])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['image']);
    }

    public function test_rejected_upload_keeps_previous_photo(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage('original.jpg')])
            ->assertStatus(201);

        $previous = Profile::first()->photo;
        $this->assertNotNull($previous);

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeNonImage()])
            ->assertStatus(422);

        $this->assertSame($previous, Profile::first()->photo);
    }

    // ---------- Ciclo de vida ----------

    public function test_post_saves_photo_and_returns_profile(): void
    {
        $admin = $this->admin();

        $response = $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage()]);

        $response->assertStatus(201)->assertJsonStructure(['photo']);

        $path = Profile::first()->photo;
        $this->assertNotNull($path);
        Storage::disk('public')->assertExists($path);
    }

    public function test_put_replaces_photo_and_deletes_previous_file(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage('primera.jpg')])
            ->assertStatus(201);

        $previous = Profile::first()->photo;
        Storage::disk('public')->assertExists($previous);

        $response = $this->fromFrontend()->actingAs($admin)
            ->put('/api/profile/photo', ['image' => $this->fakeImage('segunda.jpg')]);

        $response->assertStatus(200);

        $current = Profile::first()->photo;
        $this->assertNotSame($previous, $current);
        Storage::disk('public')->assertExists($current);
        Storage::disk('public')->assertMissing($previous);
    }

    public function test_delete_removes_photo_and_file(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage()])
            ->assertStatus(201);

        $path = Profile::first()->photo;

        $response = $this->fromFrontend()->actingAs($admin)->deleteJson('/api/profile/photo');

        $response->assertStatus(200);
        $this->assertNull(Profile::first()->photo);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_delete_without_photo_does_not_fail(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)->deleteJson('/api/profile/photo')->assertStatus(200);
    }

    public function test_photo_is_visible_on_public_profile_endpoint(): void
    {
        $admin = $this->admin();

        $this->fromFrontend()->actingAs($admin)
            ->post('/api/profile/photo', ['image' => $this->fakeImage()])
            ->assertStatus(201);

        $response = $this->getJson('/api/profile');

        $response->assertStatus(200);
        $this->assertNotNull($response->json('photo'));
    }
}
