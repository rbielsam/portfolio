<?php

namespace Tests\Feature;

use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;
use Tests\TestCase;

class ImageDriverTest extends TestCase
{
    public function test_gd_or_imagick_extension_is_available(): void
    {
        $this->assertTrue(
            extension_loaded('gd') || extension_loaded('imagick'),
            'Se requiere la extension GD o Imagick para procesar imagenes'
        );
    }

    public function test_intervention_image_facade_is_available(): void
    {
        $this->assertTrue(
            class_exists(Image::class),
            'Falta intervention/image-laravel'
        );
    }

    public function test_configured_driver_can_read_crop_and_encode_an_image(): void
    {
        $path = tempnam(sys_get_temp_dir(), 'img').'.jpg';

        Image::decodePath(__DIR__.'/fixtures/panoramica.jpg')
            ->cover(40, 40)
            ->encodeUsingFormat(Format::JPEG, quality: 82)
            ->save($path);

        $this->assertFileExists($path);

        $result = Image::decodePath($path);
        $this->assertSame(40, $result->width());
        $this->assertSame(40, $result->height());

        @unlink($path);
    }
}
