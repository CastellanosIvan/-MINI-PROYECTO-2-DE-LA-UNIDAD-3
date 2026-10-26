<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Crear usuarios de prueba predefinidos cazfixt.prueba (Password123)
        Usuario::firstOrCreate(
            ['correo' => 'gerente@cazfixt.prueba'],
            [
                'nombre' => 'Gerente',
                'apellidos' => 'CazFixt',
                'correo' => 'gerente@cazfixt.prueba',
                'clave' => Hash::make('Password123'),
                'rol' => Usuario::ROL_GERENTE,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'empleado@cazfixt.prueba'],
            [
                'nombre' => 'Empleado',
                'apellidos' => 'CazFixt',
                'correo' => 'empleado@cazfixt.prueba',
                'clave' => Hash::make('Password123'),
                'rol' => Usuario::ROL_GERENTE,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'cliente@cazfixt.prueba'],
            [
                'nombre' => 'Cliente',
                'apellidos' => 'CazFixt',
                'correo' => 'cliente@cazfixt.prueba',
                'clave' => Hash::make('Password123'),
                'rol' => Usuario::ROL_CLIENTE,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'admin@cazfixt.prueba'],
            [
                'nombre' => 'Administrador',
                'apellidos' => 'CazFixt',
                'correo' => 'admin@cazfixt.prueba',
                'clave' => Hash::make('Password123'),
                'rol' => Usuario::ROL_ADMINISTRADOR,
            ]
        );

        // 2. Crear usuarios obligatorios con roles definidos (TecNM Tuxtla)
        Usuario::firstOrCreate(
            ['correo' => 'admin@tuxtla.tecnm.mx'],
            [
                'nombre' => 'Juan',
                'apellidos' => 'Lopez',
                'correo' => 'admin@tuxtla.tecnm.mx',
                'clave' => Hash::make('123'),
                'rol' => Usuario::ROL_ADMINISTRADOR,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'gerente@tuxtla.tecnm.mx'],
            [
                'nombre' => 'Mario',
                'apellidos' => 'Sanchez',
                'correo' => 'gerente@tuxtla.tecnm.mx',
                'clave' => Hash::make('123'),
                'rol' => Usuario::ROL_GERENTE,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'mhernandez@tuxtla.tecnm.mx'],
            [
                'nombre' => 'Maria',
                'apellidos' => 'Hernandez',
                'correo' => 'mhernandez@tuxtla.tecnm.mx',
                'clave' => Hash::make('123'),
                'rol' => Usuario::ROL_CLIENTE,
            ]
        );

        Usuario::firstOrCreate(
            ['correo' => 'pmartinez@tuxtla.tecnm.mx'],
            [
                'nombre' => 'Pedro',
                'apellidos' => 'Martinez',
                'correo' => 'pmartinez@tuxtla.tecnm.mx',
                'clave' => Hash::make('123'),
                'rol' => Usuario::ROL_CLIENTE,
            ]
        );

        // 2. Ejecutar seeders de categorías y productos
        $this->call([
            CategoriaSeeder::class,
            ProductoSeeder::class,
        ]);
    }
}
