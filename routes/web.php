<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\VentaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rutas Públicas
|--------------------------------------------------------------------------
*/
Route::get('/', [ProductoController::class, 'index'])->name('home');

/*
|--------------------------------------------------------------------------
| Autenticación Manual (Solo Invitados)
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.store');
});

/*
|--------------------------------------------------------------------------
| Rutas Protegidas por Autenticación
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::get('/dashboard', function () {
        $usuario = auth()->user();
        return view('dashboard', compact('usuario'));
    })->name('dashboard');

    // CRUD de Productos (autorización controlada mediante ProductoPolicy)
    Route::resource('productos', ProductoController::class);

    // CRUD de Categorías (autorización controlada mediante CategoriaPolicy)
    Route::resource('categorias', CategoriaController::class);

    // CRUD de Ventas (autorización controlada mediante VentaPolicy)
    Route::resource('ventas', VentaController::class)->except(['edit', 'update', 'destroy']);

    // CRUD de Usuarios (autorización controlada mediante UsuarioPolicy)
    Route::resource('usuarios', UsuarioController::class)->except(['show']);
});
