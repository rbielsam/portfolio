<?php

namespace Tests\Feature;

use App\Models\Profile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfilePhotoUrlTest extends TestCase
{
    use RefreshDatabase;

    private function useCdn(): void
    {
        config([
            'filesystems.photo_disk' => 's3',
            'filesystems.disks.s3.url' => 'https://cdn.example.test',
            'filesystems.disks.s3.region' => 'eu-south-2',
            'filesystems.disks.s3.bucket' => 'bucket-prueba',
        ]);
    }

    public function test_photo_url_uses_the_configured_disk(): void
    {
        $this->useCdn();

        $profile = Profile::create(['name' => 'Portfolio', 'photo' => 'photos/foto.jpg']);

        $this->assertSame(
            'https://cdn.example.test/photos/foto.jpg',
            $profile->fresh()->photo_url
        );
    }

    public function test_photo_url_is_null_without_photo(): void
    {
        $profile = Profile::create(['name' => 'Portfolio']);

        $this->assertNull($profile->fresh()->photo_url);
    }

    public function test_photo_url_keeps_absolute_urls(): void
    {
        $profile = Profile::create([
            'name' => 'Portfolio',
            'photo' => 'https://otro.example/foto.jpg',
        ]);

        $this->assertSame('https://otro.example/foto.jpg', $profile->fresh()->photo_url);
    }

    public function test_profile_endpoint_includes_photo_url(): void
    {
        $this->useCdn();

        Profile::create(['name' => 'Portfolio', 'photo' => 'photos/foto.jpg']);

        $this->getJson('/api/profile')
            ->assertOk()
            ->assertJsonPath('photo', 'photos/foto.jpg')
            ->assertJsonPath('photo_url', 'https://cdn.example.test/photos/foto.jpg');
    }
}
