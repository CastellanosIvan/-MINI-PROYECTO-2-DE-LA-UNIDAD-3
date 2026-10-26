<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Usuario extends Authenticatable
{
    use Notifiable;

    protected $table = 'usuarios';

    public const ROL_ADMINISTRADOR = 'administrador';
    public const ROL_GERENTE = 'gerente';
    public const ROL_CLIENTE = 'cliente';

    public const ROLES = [
        self::ROL_ADMINISTRADOR,
        self::ROL_GERENTE,
        self::ROL_CLIENTE,
    ];

    protected $fillable = [
        'nombre',
        'apellidos',
        'correo',
        'clave',
        'rol',
    ];

    protected $hidden = [
        'clave',
        'remember_token',
    ];

    /**
     * El nombre del campo usado como contraseña en Laravel Auth
     */
    public function getAuthPassword()
    {
        return $this->clave;
    }

    /**
     * Relación 1 a N: Un usuario (vendedor) tiene muchos productos.
     */
    public function productos(): HasMany
    {
        return $this->hasMany(Producto::class, 'usuario_id');
    }

    /**
     * Relación 1 a N: Ventas donde el usuario actúa como cliente comprador.
     */
    public function ventasComoCliente(): HasMany
    {
        return $this->hasMany(Venta::class, 'cliente_id');
    }

    /**
     * Relación 1 a N: Ventas donde el usuario actúa como vendedor.
     */
    public function ventasComoVendedor(): HasMany
    {
        return $this->hasMany(Venta::class, 'vendedor_id');
    }

    /**
     * Relación hasManyThrough: Un usuario obtiene las categorías de sus productos.
     * Usuario -> Productos -> Categoria (a través de la tabla pivote categoria_producto)
     */
    public function categorias(): HasManyThrough
    {
        return $this->hasManyThrough(
            Categoria::class,
            Producto::class,
            'usuario_id', // Llave foránea en tabla productos
            'id',         // Llave primaria en tabla categorias
            'id',         // Llave local en tabla usuarios
            'id'          // Llave local en tabla productos
        );
    }

    // Métodos utilitarios de rol
    public function esAdministrador(): bool
    {
        return $this->rol === self::ROL_ADMINISTRADOR;
    }

    public function esGerente(): bool
    {
        return $this->rol === self::ROL_GERENTE;
    }

    public function esCliente(): bool
    {
        return $this->rol === self::ROL_CLIENTE;
    }
}
