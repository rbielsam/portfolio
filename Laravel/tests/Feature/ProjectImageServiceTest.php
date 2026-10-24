<?php

namespace Tests\Feature;

use App\Services\ProjectImageService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class ProjectImageServiceTest extends TestCase
{
    private ProjectImageService $service;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->service = new ProjectImageService;
    }

    private function makeImage(string $name, int $width, int $height, Format $format = Format::JPEG): UploadedFile
    {
        $extension = match ($format) {
            Format::PNG => 'png',
            Format::WEBP => 'webp',
            default => 'jpg',
        };

        $source = tempnam(sys_get_temp_dir(), 'src').'.'.$extension;
        Image::decodePath(__DIR__.'/fixtures/panoramica.jpg')
            ->cover($width, $height)
            ->encodeUsingFormat($format, quality: 90)
            ->save($source);

        $mime = match ($format) {
            Format::PNG => 'image/png',
            Format::WEBP => 'image/webp',
            default => 'image/jpeg',
        };

        return new UploadedFile($source, $name, $mime, null, true);
    }

    public function test_path_uses_project_directory_and_random_name(): void
    {
        $path = $this->service->store($this->makeImage('mi-captura-privada.jpg', 300, 300), 42);

        $this->assertStringStartsWith('projects/42/', $path);
        $this->assertStringEndsWith('.jpg', $path);
        $this->assertStringNotContainsString('mi-captura-privada', $path);
        $this->assertTrue(Storage::disk('public')->exists($path));
    }

    public function test_panoramic_image_is_scaled_down_without_cropping(): void
    {
        $path = $this->service->store($this->makeImage('panoramica.jpg', 2000, 1000), 1);

        $result = Image::decodePath(Storage::disk('public')->path($path));

        $this->assertSame(1600, $result->width());
        $this->assertSame(800, $result->height());
    }

    public function test_vertical_image_is_not_cropped_or_upscaled(): void
    {
        $path = $this->service->store($this->makeImage('vertical.jpg', 1000, 2000), 1);

        $result = Image::decodePath(Storage::disk('public')->path($path));

        $this->assertSame(1000, $result->width());
        $this->assertSame(2000, $result->height());
    }

    public function test_small_image_keeps_its_size(): void
    {
        $path = $this->service->store($this->makeImage('pequena.jpg', 800, 600), 1);

        $result = Image::decodePath(Storage::disk('public')->path($path));

        $this->assertSame(800, $result->width());
        $this->assertSame(600, $result->height());
    }

    public function test_png_and_webp_keep_their_format(): void
    {
        $png = $this->service->store($this->makeImage('captura.png', 900, 500, Format::PNG), 1);
        $webp = $this->service->store($this->makeImage('captura.webp', 900, 500, Format::WEBP), 1);

        $this->assertStringEndsWith('.png', $png);
        $this->assertStringEndsWith('.webp', $webp);
        Storage::disk('public')->assertExists($png);
        Storage::disk('public')->assertExists($webp);
    }

    public function test_delete_removes_the_file(): void
    {
        $path = $this->service->store($this->makeImage('borrar.jpg', 300, 300), 1);

        Storage::disk('public')->assertExists($path);

        $this->service->delete($path);

        Storage::disk('public')->assertMissing($path);
    }

    public function test_delete_does_not_fail_when_file_is_missing(): void
    {
        $this->service->delete('projects/1/no-existe.jpg');
        $this->service->delete(null);

        $this->assertTrue(true);
    }

    public function test_delete_ignores_paths_outside_projects_directory(): void
    {
        Storage::disk('public')->put('photos/foto.jpg', 'contenido');

        $this->service->delete('photos/foto.jpg');

        Storage::disk('public')->assertExists('photos/foto.jpg');
    }

    public function test_stores_on_the_configured_disk(): void
    {
        Storage::fake('s3');
        config(['filesystems.photo_disk' => 's3']);

        $path = $this->service->store($this->makeImage('s3.jpg', 300, 300), 7);

        Storage::disk('s3')->assertExists($path);
        Storage::disk('public')->assertMissing($path);
    }

    public function test_delete_uses_the_configured_disk(): void
    {
        Storage::fake('s3');
        config(['filesystems.photo_disk' => 's3']);

        $path = $this->service->store($this->makeImage('borrar-s3.jpg', 300, 300), 7);

        Storage::disk('s3')->assertExists($path);

        $this->service->delete($path);

        Storage::disk('s3')->assertMissing($path);
    }
}
