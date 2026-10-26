<?php

namespace App\Policies;

use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class ProductoPolicy
{
    use HandlesAuthorization;

    public function viewAny(?Usuario $user): bool
    {
        return true; // Cualquier persona (incluso clientes) puede ver el catálogo
    }

    public function view(?Usuario $user, Producto $producto): bool
    {
        return true;
    }

    /**
     * Solo administradores y gerentes pueden registrar productos.
     */
    public function create(Usuario $user): Response
    {
        return in_array($user->rol, [Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE])
            ? Response::allow()
            : Response::deny('Acceso denegado: Solo el personal administrativo o vendedores pueden dar de alta productos.');
    }

    /**
     * Administradores pueden editar cualquier producto.
     * Gerentes solo pueden editar sus propios productos (donde usuario_id coincide).
     */
    public function update(Usuario $user, Producto $producto): Response
    {
        if ($user->esAdministrador()) {
            return Response::allow();
        }

        if ($user->esGerente() && $producto->usuario_id === $user->id) {
            return Response::allow();
        }

        return Response::deny('Acceso denegado: No tienes autorización para editar este producto.');
    }

    /**
     * Solo administradores o el propietario del producto pueden eliminarlo.
     */
    public function delete(Usuario $user, Producto $producto): Response
    {
        if ($user->esAdministrador()) {
            return Response::allow();
        }

        if ($user->esGerente() && $producto->usuario_id === $user->id) {
            return Response::allow();
        }

        return Response::deny('Acceso denegado: No tienes autorización para eliminar este producto.');
    }
}
