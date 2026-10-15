<?php

namespace Tests\Feature;

use App\Services\ProfilePhotoService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class ProfilePhotoServiceTest extends TestCase
{
    private ProfilePhotoService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->service = new ProfilePhotoService();
    }

    private function makeImage(string $name, int $width, int $height): UploadedFile
    {
        $source = tempnam(sys_get_temp_dir(), 'src').'.jpg';
        Image::decodePath(__DIR__.'/fixtures/panoramica.jpg')
            ->cover($width, $height)
            ->encodeUsingFormat(Format::JPEG, quality: 90)
            ->save($source);

        return new UploadedFile($source, $name, 'image/jpeg', null, true);
    }

    public function test_panoramic_image_is_cropped_to_square(): void
    {
        $file = $this->makeImage('panoramica.jpg', 300, 100);

        $path = $this->service->store($file);

        $this->assertStringStartsWith('photos/', $path);

        $full = Storage::disk('public')->path($path);
        $result = Image::decodePath($full);

        $this->assertSame(800, $result->width());
        $this->assertSame(800, $result->height());
    }

    public function test_square_image_keeps_its_shape(): void
    {
        $file = $this->makeImage('cuadrada.jpg', 500, 500);

        $path = $this->service->store($file);
        $result = Image::decodePath(Storage::disk('public')->path($path));

        $this->assertSame(800, $result->width());
        $this->assertSame(800, $result->height());
    }

    public function test_vertical_image_is_cropped_to_square(): void
    {
        $file = $this->makeImage('vertical.jpg', 100, 300);

        $path = $this->service->store($file);
        $result = Image::decodePath(Storage::disk('public')->path($path));

        $this->assertSame(800, $result->width());
        $this->assertSame(800, $result->height());
    }

    public function test_png_transparency_is_preserved(): void
    {
        $source = tempnam(sys_get_temp_dir(), 'png').'.png';
        Image::decodePath(__DIR__.'/fixtures/panoramica.jpg')
            ->cover(200, 200)
            ->encodeUsingFormat(Format::PNG)
            ->save($source);

        $file = new UploadedFile($source, 'transparente.png', 'image/png', null, true);

        $path = $this->service->store($file);

        $this->assertStringEndsWith('.png', $path);
        $this->assertTrue(Storage::disk('public')->exists($path));
    }

    public function test_filename_is_random_and_hides_original_name(): void
    {
        $file = $this->makeImage('mi-foto-privada.jpg', 300, 300);

        $path = $this->service->store($file);

        $this->assertStringNotContainsString('mi-foto-privada', $path);
        $this->assertStringNotContainsString('mi-foto-privada', basename($path));
    }

    public function test_stored_extension_matches_upload_format(): void
    {
        $file = $this->makeImage('foto.jpg', 300, 300);

        $path = $this->service->store($file);

        $this->assertStringEndsWith('.jpg', $path);
    }

    public function test_delete_removes_the_file(): void
    {
        $file = $this->makeImage('borrar.jpg', 300, 300);
        $path = $this->service->store($file);

        $this->assertTrue(Storage::disk('public')->exists($path));

        $this->service->delete($path);

        $this->assertFalse(Storage::disk('public')->exists($path));
    }

    public function test_delete_does_not_fail_when_file_is_missing(): void
    {
        $this->service->delete('photos/no-existe.jpg');
        $this->service->delete(null);

        $this->assertTrue(true);
    }
}
