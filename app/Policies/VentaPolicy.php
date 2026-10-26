<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Venta;
use Illuminate\Auth\Access\HandlesAuthorization;
use Illuminate\Auth\Access\Response;

class VentaPolicy
{
    use HandlesAuthorization;

    public function viewAny(Usuario $user): bool
    {
        return true;
    }

    public function view(Usuario $user, Venta $venta): Response
    {
        if ($user->esAdministrador() || $user->esGerente()) {
            return Response::allow();
        }

        if ($venta->cliente_id === $user->id) {
            return Response::allow();
        }

        return Response::deny('Acceso denegado: Solo puedes consultar tus propias compras.');
    }

    /**
     * Clientes pueden comprar productos.
     */
    public function create(Usuario $user): Response
    {
        return in_array($user->rol, [Usuario::ROL_CLIENTE, Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE])
            ? Response::allow()
            : Response::deny('Acceso denegado: No estás autorizado para realizar compras.');
    }
}
