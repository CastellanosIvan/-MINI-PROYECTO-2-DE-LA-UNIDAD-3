<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVentaRequest;
use App\Models\Producto;
use App\Models\Venta;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class VentaController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', Venta::class);

        $usuario = Auth::user();
        $query = Venta::with(['producto', 'cliente', 'vendedor']);

        // Clientes solo ven sus compras
        if ($usuario->esCliente()) {
            $query->where('cliente_id', $usuario->id);
        }

        $ventas = $query->orderBy('fecha', 'desc')->paginate(10);

        return view('ventas.index', compact('ventas'));
    }

    public function create(Request $request)
    {
        $this->authorize('create', Venta::class);

        $productoSeleccionado = null;
        if ($request->filled('producto_id')) {
            $productoSeleccionado = Producto::find($request->input('producto_id'));
        }

        $productos = Producto::where('existencia', '>', 0)->orderBy('nombre')->get();

        return view('ventas.create', compact('productos', 'productoSeleccionado'));
    }

    public function store(StoreVentaRequest $request)
    {
        $this->authorize('create', Venta::class);

        $datos = $request->validated();
        $producto = Producto::findOrFail($datos['producto_id']);
        $cantidad = (int) $datos['cantidad'];

        if ($producto->existencia < $cantidad) {
            return back()->withErrors(['cantidad' => 'Existencias insuficientes. Disponibles: ' . $producto->existencia])
                         ->withInput();
        }

        $total = $producto->precio * $cantidad;
        $clienteId = Auth::id();
        $vendedorId = $producto->usuario_id;
        $fecha = $datos['fecha'] ?? now();

        $venta = DB::transaction(function () use ($producto, $cantidad, $total, $clienteId, $vendedorId, $fecha) {
            // Descontar existencia
            $producto->decrement('existencia', $cantidad);

            return Venta::create([
                'producto_id' => $producto->id,
                'vendedor_id' => $vendedorId,
                'cliente_id' => $clienteId,
                'fecha' => $fecha,
                'total' => $total,
            ]);
        });

        // Bitácora obligatoria
        Log::channel('ventas')->info('Venta creada', [
            'venta_id' => $venta->id,
            'producto_id' => $producto->id,
            'producto_nombre' => $producto->nombre,
            'cantidad' => $cantidad,
            'total' => $total,
            'cliente_id' => $clienteId,
            'vendedor_id' => $vendedorId,
            'fecha' => $fecha,
            'ip' => $request->ip(),
        ]);

        return redirect()->route('ventas.index')->with('success', '¡Compra realizada con éxito! Total: $' . number_format($total, 2));
    }

    public function show(Venta $venta)
    {
        $this->authorize('view', $venta);
        $venta->load(['producto', 'cliente', 'vendedor']);

        return view('ventas.show', compact('venta'));
    }
}
