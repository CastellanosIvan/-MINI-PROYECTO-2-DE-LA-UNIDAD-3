<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class UsuarioController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Usuario::class);

        $query = Usuario::query();

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where('nombre', 'like', "%{$q}%")
                  ->orWhere('apellidos', 'like', "%{$q}%")
                  ->orWhere('correo', 'like', "%{$q}%");
        }

        if ($request->filled('rol')) {
            $query->where('rol', $request->input('rol'));
        }

        $usuarios = $query->orderBy('id', 'desc')->paginate(10)->withQueryString();
        $roles = Usuario::ROLES;

        return view('usuarios.index', compact('usuarios', 'roles'));
    }

    public function create()
    {
        $this->authorize('create', Usuario::class);

        $roles = Usuario::ROLES;
        return view('usuarios.create', compact('roles'));
    }

    public function store(StoreUsuarioRequest $request)
    {
        $this->authorize('create', Usuario::class);

        $datos = $request->validated();
        $datos['clave'] = Hash::make($datos['clave']);

        Usuario::create($datos);

        return redirect()->route('usuarios.index')->with('success', 'Usuario registrado exitosamente.');
    }

    public function edit(Usuario $usuario)
    {
        $this->authorize('update', $usuario);

        $roles = Usuario::ROLES;
        return view('usuarios.edit', compact('usuario', 'roles'));
    }

    public function update(UpdateUsuarioRequest $request, Usuario $usuario)
    {
        $this->authorize('update', $usuario);

        $datos = $request->validated();

        if (!empty($datos['clave'])) {
            $datos['clave'] = Hash::make($datos['clave']);
        } else {
            unset($datos['clave']);
        }

        // Si el usuario es gerente, no puede cambiar el rol a administrador
        if (Auth::user()->esGerente()) {
            $datos['rol'] = Usuario::ROL_CLIENTE;
        }

        $usuario->update($datos);

        return redirect()->route('usuarios.index')->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(Usuario $usuario)
    {
        $this->authorize('delete', $usuario);

        $usuario->delete();

        return redirect()->route('usuarios.index')->with('success', 'Usuario eliminado.');
    }
}
