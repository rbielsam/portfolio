<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadProfilePhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if (! $this->hasFile('image')) {
            return;
        }

        $file = $this->file('image');

        if ($file->isValid()) {
            return;
        }

        $this->merge(['image' => null]);
    }
}
