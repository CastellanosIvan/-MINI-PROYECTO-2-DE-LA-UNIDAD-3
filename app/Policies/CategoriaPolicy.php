<?php

namespace App\Policies;

use App\Models\Categoria;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class CategoriaPolicy
{
    use HandlesAuthorization;

    public function viewAny(?Usuario $user): bool
    {
        return true;
    }

    public function create(Usuario $user): Response
    {
        return in_array($user->rol, [Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE])
            ? Response::allow()
            : Response::deny('Acceso denegado: Se requiere rol de Administrador o Gerente para crear categorías.');
    }

    public function update(Usuario $user, Categoria $categoria): Response
    {
        return in_array($user->rol, [Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE])
            ? Response::allow()
            : Response::deny('Acceso denegado: Se requiere rol de Administrador o Gerente para editar categorías.');
    }

    public function delete(Usuario $user, Categoria $categoria): Response
    {
        return $user->esAdministrador()
            ? Response::allow()
            : Response::deny('Acceso denegado: Solo el Administrador puede eliminar categorías.');
    }
}
