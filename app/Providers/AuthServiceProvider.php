<?php

namespace App\Providers;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use App\Models\Venta;
use App\Policies\CategoriaPolicy;
use App\Policies\ProductoPolicy;
use App\Policies\UsuarioPolicy;
use App\Policies\VentaPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Mapeo de políticas de autorización para las entidades del modelo.
     */
    protected $policies = [
        Usuario::class => UsuarioPolicy::class,
        Producto::class => ProductoPolicy::class,
        Categoria::class => CategoriaPolicy::class,
        Venta::class => VentaPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();

        // Gate: Solo administradores pueden gestionar usuarios globalmente
        Gate::define('administrar-usuarios', function (Usuario $user) {
            return $user->esAdministrador();
        });

        // Gate: Administradores y gerentes pueden administrar catálogo
        Gate::define('administrar-catalogo', function (Usuario $user) {
            return in_array($user->rol, [Usuario::ROL_ADMINISTRADOR, Usuario::ROL_GERENTE]);
        });

        // Gate: Solo clientes pueden realizar compras en línea
        Gate::define('comprar-productos', function (Usuario $user) {
            return $user->esCliente();
        });

        // Gate: Acceso a reportes y bitácoras
        Gate::define('ver-bitacoras', function (Usuario $user) {
            return $user->esAdministrador();
        });
    }
}
