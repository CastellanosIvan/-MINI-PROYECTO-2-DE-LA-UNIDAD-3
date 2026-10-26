<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:2', 'max:100'],
            'apellidos' => ['required', 'string', 'min:2', 'max:100'],
            'correo' => ['required', 'email', 'max:150', 'unique:usuarios,correo'],
            'clave' => ['required', 'string', 'min:3'],
            'rol' => ['required', Rule::in(['administrador', 'gerente', 'cliente'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre es obligatorio.',
            'apellidos.required' => 'Los apellidos son obligatorios.',
            'correo.required' => 'El correo es obligatorio.',
            'correo.email' => 'El correo debe tener un formato válido.',
            'correo.unique' => 'Este correo ya está registrado.',
            'clave.required' => 'La contraseña es obligatoria.',
            'rol.required' => 'El rol es obligatorio.',
        ];
    }
}
