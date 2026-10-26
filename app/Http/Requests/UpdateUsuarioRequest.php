<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $usuarioId = $this->route('usuario')?->id ?? $this->route('id');

        return [
            'nombre' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'correo' => ['required', 'email', 'max:150', Rule::unique('usuarios', 'correo')->ignore($usuarioId)],
            'clave' => ['nullable', 'string', 'min:3'],
            'rol' => ['required', Rule::in(['administrador', 'gerente', 'cliente'])],
        ];
    }
}
