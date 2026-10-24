<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProjectImage extends Model
{
    protected $table = 'project_images';

    protected $fillable = ['path', 'caption', 'position'];

    protected $appends = ['url'];

    protected $hidden = ['path', 'project_id', 'created_at', 'updated_at'];

    protected $casts = [
        'position' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    protected function url(): Attribute
    {
        return Attribute::get(function (): ?string {
            if (blank($this->path)) {
                return null;
            }

            if (Str::startsWith($this->path, ['http://', 'https://'])) {
                return $this->path;
            }

            return Storage::disk(config('filesystems.photo_disk', 'public'))->url($this->path);
        });
    }
}
