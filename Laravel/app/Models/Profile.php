<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Profile extends Model
{
    protected $table = 'profile';

    protected $fillable = ['name', 'title', 'bio', 'github_url', 'linkedin_url', 'photo'];

    protected $appends = ['photo_url'];

    protected function photoUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (blank($this->photo)) {
                return null;
            }

            if (Str::startsWith($this->photo, ['http://', 'https://'])) {
                return $this->photo;
            }

            return Storage::disk(config('filesystems.photo_disk', 'public'))->url($this->photo);
        });
    }
}
