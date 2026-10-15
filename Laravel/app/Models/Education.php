<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    protected $table = 'education';

    protected $fillable = ['title', 'institution', 'start_date', 'end_date', 'description', 'is_current'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    /**
     * En la base de datos se guarda la fecha completa, pero la API solo publica mes y año.
     */
    public function toArray(): array
    {
        $data = parent::toArray();

        $data['start_date'] = $this->start_date?->format('Y-m');
        $data['end_date'] = $this->end_date?->format('Y-m');

        return $data;
    }
}
