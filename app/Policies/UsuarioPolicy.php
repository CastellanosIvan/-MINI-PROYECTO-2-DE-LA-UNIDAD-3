<?php

namespace App\Policies;

use App\Models\Usuario;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class UsuarioPolicy
{
    use HandlesAuthorization;

    /**
     * Determina si el usuario puede listar los usuarios.
     */
    public function viewAny(Usuario $user): bool
    {
        return in_array($user->rol, [Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE]);
    }

    /**
     * Determina si el usuario puede crear nuevos usuarios.
     * REGLA: Solo el Administrador puede crear usuarios.
     */
    public function create(Usuario $user): Response
    {
        return $user->esAdministrador()
            ? Response::allow()
            : Response::deny('Acceso denegado: Únicamente los administradores pueden crear usuarios.');
    }

    /**
     * Determina si el usuario puede actualizar a otro usuario.
     * REGLA:
     * - Administrador: Puede editar a cualquier usuario.
     * - Gerente: Puede editar clientes, NO puede editar gerentes, NO puede editar administradores.
     * - Cliente: No puede editar a otros usuarios.
     */
    public function update(Usuario $user, Usuario $target): Response
    {
        if ($user->esAdministrador()) {
            return Response::allow();
        }

        if ($user->esGerente()) {
            if ($target->rol === Usuario::ROL_CLIENTE) {
                return Response::allow();
            }

            return Response::deny('Acceso denegado: Los gerentes solo pueden editar clientes; no tienen permiso para editar gerentes ni administradores.');
        }

        return Response::deny('Acceso denegado: No tienes autorización para editar este usuario.');
    }

    /**
     * Determina si el usuario puede eliminar a otro usuario.
     * REGLA: Solo el Administrador puede eliminar usuarios (y no a sí mismo).
     */
    public function delete(Usuario $user, Usuario $target): Response
    {
        if (!$user->esAdministrador()) {
            return Response::deny('Acceso denegado: Únicamente los administradores pueden eliminar usuarios.');
        }

        if ($user->id === $target->id) {
            return Response::deny('No puedes eliminar tu propia cuenta de administrador.');
        }

        return Response::allow();
    }
}
