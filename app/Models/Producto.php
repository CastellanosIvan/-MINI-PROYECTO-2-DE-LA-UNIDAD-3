<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Producto extends Model
{
    protected $table = 'productos';

    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'existencia',
        'usuario_id',
    ];

    protected $casts = [
        'precio' => 'decimal:2',
        'existencia' => 'integer',
    ];

    /**
     * Relación N a 1: El producto pertenece a un Usuario (vendedor).
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Alias para identificar semánticamente al vendedor.
     */
    public function vendedor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Relación Muchos a Muchos: Un producto pertenece a muchas categorías.
     */
    public function categorias(): BelongsToMany
    {
        return $this->belongsToMany(Categoria::class, 'categoria_producto', 'producto_id', 'categoria_id')
                    ->withTimestamps();
    }

    /**
     * Relación 1 a N: Un producto tiene muchas ventas registradas.
     */
    public function ventas(): HasMany
    {
        return $this->hasMany(Venta::class, 'producto_id');
    }
}
