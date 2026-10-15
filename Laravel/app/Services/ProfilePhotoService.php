<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Format;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Interfaces\ImageInterface;

class ProfilePhotoService
{
    public const SIZE = 800;

    public const QUALITY = 82;

    public const DIRECTORY = 'photos';

    public const DISK = 'public';

    public function store(UploadedFile $file): string
    {
        $extension = $this->extensionFor($file);
        $path = self::DIRECTORY.'/'.Str::random(32).'.'.$extension;

        $image = Image::decode($file->getRealPath())
            ->cover(self::SIZE, self::SIZE)
            ->orient();

        Storage::disk(self::DISK)->put(
            $path,
            $image->encodeUsingFormat($this->formatFor($extension), quality: self::QUALITY)
        );

        return $path;
    }

    public function replace(?string $previousPath, UploadedFile $file): string
    {
        $path = $this->store($file);

        $this->delete($previousPath);

        return $path;
    }

    public function delete(?string $path): void
    {
        if (blank($path)) {
            return;
        }

        if (! str_starts_with($path, self::DIRECTORY.'/')) {
            return;
        }

        Storage::disk(self::DISK)->delete($path);
    }

    private function extensionFor(UploadedFile $file): string
    {
        return strtolower($file->getClientOriginalExtension());
    }

    private function formatFor(string $extension): Format
    {
        return match ($extension) {
            'png' => Format::PNG,
            'webp' => Format::WEBP,
            default => Format::JPEG,
        };
    }
}
