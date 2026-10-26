# CazFixt – Primera entrega (Laravel 11)

## Instalación
1. `composer create-project laravel/laravel cazfixt`
2. Copia el contenido de este paquete sobre el proyecto (reemplaza `routes/web.php`, `bootstrap/app.php`, `app/Models/User.php`, `database/seeders/DatabaseSeeder.php`).
3. Configura la BD en `.env` (MySQL o SQLite).
4. `php artisan migrate --seed`
5. `php artisan serve` → http://127.0.0.1:8000

## Usuarios de prueba (contraseña: Password123)
- gerente@cazfixt.test
- empleado@cazfixt.test
- cliente@cazfixt.test
