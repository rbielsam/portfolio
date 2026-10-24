<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = ['title', 'description', 'url', 'image', 'technologies', 'date'];

    protected $appends = ['cover_url'];

    protected $casts = [
        'date' => 'date',
    ];

    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('position')->orderBy('id');
    }

    /**
     * En la base de datos se guarda la fecha completa, pero la API solo publica mes y año.
     */
    public function toArray(): array
    {
        $data = parent::toArray();

        $data['date'] = $this->date?->format('Y-m');

        return $data;
    }

    protected function coverUrl(): Attribute
    {
        return Attribute::get(function (): ?string {
            $first = $this->relationLoaded('images')
                ? $this->images->first()
                : $this->images()->first();

            if ($first) {
                return $first->url;
            }

            if (blank($this->image)) {
                return null;
            }

            if (Str::startsWith($this->image, ['http://', 'https://'])) {
                return $this->image;
            }

            return Storage::disk(config('filesystems.photo_disk', 'public'))->url($this->image);
        });
    }
}
