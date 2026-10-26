<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoriaRequest;
use App\Models\Categoria;
use Illuminate\Http\Request;

class CategoriaController extends Controller
{
    public function index()
    {
        $this->authorize('viewAny', Categoria::class);

        $categorias = Categoria::withCount('productos')->orderBy('nombre')->paginate(10);

        return view('categorias.index', compact('categorias'));
    }

    public function create()
    {
        $this->authorize('create', Categoria::class);

        return view('categorias.create');
    }

    public function store(StoreCategoriaRequest $request)
    {
        $this->authorize('create', Categoria::class);

        $categoria = Categoria::create($request->validated());

        return redirect()->route('categorias.index')->with('success', 'Categoría creada con éxito.');
    }

    public function show(Categoria $categoria)
    {
        $categoria->load('productos.vendedor');

        return view('categorias.show', compact('categoria'));
    }

    public function edit(Categoria $categoria)
    {
        $this->authorize('update', $categoria);

        return view('categorias.edit', compact('categoria'));
    }

    public function update(StoreCategoriaRequest $request, Categoria $categoria)
    {
        $this->authorize('update', $categoria);

        $categoria->update($request->validated());

        return redirect()->route('categorias.index')->with('success', 'Categoría actualizada correctamente.');
    }

    public function destroy(Categoria $categoria)
    {
        $this->authorize('delete', $categoria);

        $categoria->delete();

        return redirect()->route('categorias.index')->with('success', 'Categoría eliminada.');
    }
}
