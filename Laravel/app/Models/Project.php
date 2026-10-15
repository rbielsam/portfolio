<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $table = 'projects';

    protected $fillable = ['title', 'description', 'url', 'image', 'technologies', 'date'];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * En la base de datos se guarda la fecha completa, pero la API solo publica mes y año.
     */
    public function toArray(): array
    {
        $data = parent::toArray();

        $data['date'] = $this->date?->format('Y-m');

        return $data;
    }
}
