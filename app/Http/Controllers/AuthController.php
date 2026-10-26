<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    /**
     * Login manual sin dependencias de paquetes (Breeze, Jetstream o UI).
     * Se usa Auth::attempt() y se audita con Log::channel('autenticacion').
     */
    public function login(Request $request)
    {
        $credenciales = [
            'correo' => $request->input('correo'),
            'password' => $request->input('clave'),
        ];

        if (Auth::attempt($credenciales, $request->boolean('remember'))) {
            $request->session()->regenerate();
            $usuario = Auth::user();

            Log::channel('autenticacion')->info('Login exitoso', [
                'usuario_id' => $usuario->id,
                'nombre' => $usuario->nombre . ' ' . $usuario->apellidos,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'ip' => $request->ip(),
            ]);

            return redirect()->intended(route('dashboard'))
                ->with('success', 'Bienvenido(a), ' . $usuario->nombre . ' (' . ucfirst($usuario->rol) . ')');
        }

        Log::channel('autenticacion')->warning('Login incorrecto', [
            'correo' => $request->input('correo'),
            'ip' => $request->ip(),
            'motivo' => 'Credenciales inválidas',
        ]);

        return back()
            ->withErrors(['correo' => 'Las credenciales no coinciden con nuestros registros.'])
            ->onlyInput('correo');
    }

    public function logout(Request $request)
    {
        $usuario = Auth::user();

        if ($usuario) {
            Log::channel('autenticacion')->info('Logout exitoso', [
                'usuario_id' => $usuario->id,
                'correo' => $usuario->correo,
                'rol' => $usuario->rol,
                'ip' => $request->ip(),
            ]);
        }

        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'Sesión cerrada correctamente.');
    }
}
