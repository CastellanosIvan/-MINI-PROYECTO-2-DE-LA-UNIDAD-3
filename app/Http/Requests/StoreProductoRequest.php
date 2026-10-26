<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // La autorización se delega a la Policy
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:3', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:1000'],
            'precio' => ['required', 'numeric', 'min:0.01'],
            'existencia' => ['required', 'integer', 'min:0'],
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'categorias' => ['nullable', 'array'],
            'categorias.*' => ['integer', 'exists:categorias,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del producto es obligatorio.',
            'nombre.min' => 'El nombre debe tener al menos 3 caracteres.',
            'precio.required' => 'El precio es obligatorio.',
            'precio.numeric' => 'El precio debe ser un número válido.',
            'precio.min' => 'El precio debe ser mayor a 0.',
            'existencia.required' => 'La existencia en stock es obligatoria.',
            'existencia.integer' => 'La existencia debe ser un número entero.',
            'usuario_id.required' => 'El vendedor es obligatorio.',
            'usuario_id.exists' => 'El vendedor seleccionado no existe.',
            'categorias.*.exists' => 'Una o más categorías seleccionadas no son válidas.',
        ];
    }
}
