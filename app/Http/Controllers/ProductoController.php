<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProductoRequest;
use App\Http\Requests\UpdateProductoRequest;
use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Producto::class);

        $query = Producto::with(['vendedor', 'categorias']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where('nombre', 'like', "%{$q}%")
                  ->orWhere('descripcion', 'like', "%{$q}%");
        }

        if ($request->filled('categoria_id')) {
            $catId = $request->input('categoria_id');
            $query->whereHas('categorias', fn($c) => $c->where('categorias.id', $catId));
        }

        $productos = $query->orderBy('id', 'desc')->paginate(12)->withQueryString();
        $categorias = Categoria::orderBy('nombre')->get();

        return view('productos.index', compact('productos', 'categorias'));
    }

    public function create()
    {
        $this->authorize('create', Producto::class);

        $categorias = Categoria::orderBy('nombre')->get();
        $vendedores = Usuario::whereIn('rol', ['administrador', 'gerente'])->orderBy('nombre')->get();

        return view('productos.create', compact('categorias', 'vendedores'));
    }

    public function store(StoreProductoRequest $request)
    {
        $this->authorize('create', Producto::class);

        $datos = $request->validated();
        $categoriasIds = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto = Producto::create($datos);

        if (!empty($categoriasIds)) {
            $producto->categorias()->sync($categoriasIds);
        }

        Log::channel('productos')->info('Producto creado', [
            'producto_id' => $producto->id,
            'nombre' => $producto->nombre,
            'precio' => $producto->precio,
            'existencia' => $producto->existencia,
            'vendedor_id' => $producto->usuario_id,
            'usuario_autenticado' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        return redirect()->route('productos.index')->with('success', 'Producto registrado correctamente.');
    }

    public function show(Producto $producto)
    {
        $this->authorize('view', $producto);
        $producto->load(['vendedor', 'categorias']);

        return view('productos.show', compact('producto'));
    }

    public function edit(Producto $producto)
    {
        $this->authorize('update', $producto);

        $categorias = Categoria::orderBy('nombre')->get();
        $vendedores = Usuario::whereIn('rol', ['administrador', 'gerente'])->orderBy('nombre')->get();

        return view('productos.edit', compact('producto', 'categorias', 'vendedores'));
    }

    public function update(UpdateProductoRequest $request, Producto $producto)
    {
        $this->authorize('update', $producto);

        $datos = $request->validated();
        $categoriasIds = $datos['categorias'] ?? [];
        unset($datos['categorias']);

        $producto->update($datos);
        $producto->categorias()->sync($categoriasIds);

        Log::channel('productos')->info('Producto actualizado', [
            'producto_id' => $producto->id,
            'nombre' => $producto->nombre,
            'precio' => $producto->precio,
            'existencia' => $producto->existencia,
            'usuario_autenticado' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        return redirect()->route('productos.index')->with('success', 'Producto actualizado exitosamente.');
    }

    public function destroy(Request $request, Producto $producto)
    {
        $this->authorize('delete', $producto);

        $id = $producto->id;
        $nombre = $producto->nombre;

        $producto->delete();

        Log::channel('productos')->info('Producto eliminado', [
            'producto_id' => $id,
            'nombre' => $nombre,
            'usuario_autenticado' => Auth::id(),
            'ip' => $request->ip(),
        ]);

        return redirect()->route('productos.index')->with('success', 'Producto eliminado.');
    }
}
