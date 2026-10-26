# Mini Proyecto 2 — Arquitectura de Autorización y Control de Acceso E-commerce

Plan para refinar la segregación de accesos por rol, eliminar artefactos visuales de prueba en la interfaz, habilitar la visualización pública del catálogo para visitantes no autenticados y blindar las políticas de autorización (Policies y Gates) en los módulos de Clientes, Gerentes y Administradores.

### User Review & Critical Decisions

> [!IMPORTANT]
> Decisiones confirmadas a partir de las respuestas del usuario:
> - **Ingreso Manual sin Credenciales Visibles**: Se retira cualquier recuadro de credenciales de prueba o autocompletado en `/login`, exigiendo captura manual de correo y contraseña.
> - **Eliminación de la Barra de Depuración**: Se remueve de raíz la barra superior académica (`.academic-bar` con "Mini proyecto...", "probar usuarios", etc.) para lograr una interfaz de producción limpia.
> - **Navegación y Catálogo Público para Visitantes Anónimos**: Un visitante sin iniciar sesión puede navegar libremente por el catálogo de refacciones y categorías. Al hacer clic en "Comprar", el sistema solicita iniciar sesión.
> - **Segregación Estricta de Roles (Seguridad y Menús)**:
>   - **Cliente**: Solo ve el catálogo y puede comprar. En la barra de navegación **no** tiene enlaces a "Ventas", "Usuarios", "Categorías" ni opciones de administración. Solo consulta "Mis Compras" en su panel `/dashboard/cliente`.
>   - **Gerente**: Acceso al CRUD de sus productos, administración de categorías, visualización de ventas globales y edición restringida a usuarios con rol `cliente` (bloqueo estricto para editar gerentes o administradores).
>   - **Administrador**: Control total sobre usuarios, catálogo, categorías, ventas y visualización exclusiva de bitácoras del sistema (`storage/logs/*`).

---

### 1. Overview & Core Concept

El objetivo es alinear el sistema E-commerce de CazFixt con las directrices de producción y la rúbrica del **Mini Proyecto 2**:
- **Experiencia de Usuario Limpia**: La cabecera superior y el inicio de sesión se presentan sin elementos de ayuda visuales artificiales ni barras de depuración.
- **Acceso Democrático al Catálogo**: Los visitantes y clientes exploran refacciones y herramientas móviles (inspiradas en At Home México) sin barreras de entrada.
- **Autorización Delegada en Policies**: El control de acceso a rutas, botones y formularios responde a las reglas de negocio declaradas en `UsuarioPolicy`, `ProductoPolicy`, `CategoriaPolicy` y `VentaPolicy`.

---

### 2. User Experience & Visual Design

#### A. Navegación Dinámica por Rol (Navbar)
La barra de navegación (`views/partials/header.ejs`) se adapta dinámicamente al estado de autenticación:
- **Visitante Anónimo (Guest)**:
  - `Inicio` (`/`) · `Quiénes somos` · `Misión y visión` · `Ubicación` · `Contáctanos` · `Catálogo` (`/productos`) · `Iniciar sesión` (`/login`) · `Registrarse` (`/registro`)
- **Cliente Autenticado**:
  - `Inicio` · `Catálogo` · `Mi Panel` (`/dashboard/cliente`) · `Cerrar sesión`
  - *No se muestran enlaces a Ventas globales, Usuarios, Categorías ni Bitácoras.*
- **Gerente Autenticado**:
  - `Inicio` · `Catálogo` · `Categorías` · `Ventas` · `Clientes` (`/usuarios`) · `Mi Panel` (`/dashboard/gerente`) · `Cerrar sesión`
- **Administrador Autenticado**:
  - `Inicio` · `Catálogo` · `Categorías` · `Ventas` · `Usuarios` · `Bitácoras AAA` · `Diagrama ER` · `Mi Panel` · `Cerrar sesión`

#### B. Flujo de Compra para Visitantes y Clientes
1. Un visitante ingresa a `/productos` o filtra por categorías.
2. Al pulsar **"Comprar Refacción"**, si no ha iniciado sesión, es redirigido a `/login` con un mensaje amigable: *"Inicia sesión o regístrate para completar tu compra"*.
3. Tras autenticarse como `cliente`, se le conduce directamente al formulario de compra con el producto seleccionado.
4. Una vez procesada la compra, se descuenta el stock, se escribe el registro en `storage/logs/ventas.log` y el pedido aparece en su historial "Mis Compras Realizadas" en `/dashboard/cliente`.

#### C. Pantalla de Inicio de Sesión (`/login`)
- Formulario pulcro y sobrio con campos `correo` institucional y `clave`.
- Sin listas ni botones de cuentas de prueba.
- Manejo claro de mensajes de error de credenciales ("Las credenciales no coinciden con nuestros registros") y registro automático de intentos fallidos en `storage/logs/autenticacion.log`.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Ocultamiento de Controles en UI vs. Blindaje en Backend**
  - *Enfoque*: Se aplican ambos niveles. En la vista (UI), los botones de edición, creación y eliminación no se renderizan para roles sin permiso. En el backend, las rutas (`POST`, `PUT`, `DELETE`) ejecutan las validaciones correspondientes de `UsuarioPolicy`, `ProductoPolicy`, etc., retornando error y mensaje de acceso denegado si se intenta forzar la acción por URL o formulario.
- **Decisión 2: Consulta de Ventas para Clientes**
  - *Enfoque*: La ruta `/ventas` queda reservada exclusivamente para Gerente y Administrador. Los clientes consultan su historial de pedidos directamente en su panel `/dashboard/cliente`.
- **Decisión 3: Catálogo Público Sin Barrera de Login**
  - *Enfoque*: Permitir que cualquier visitante examine el inventario de refacciones y herramientas sin forzar inicio de sesión previo, fomentando la conversión y simulando el flujo real de una tienda de comercio electrónico como `athomemx.mx`.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          NAVEGADOR / CLIENTE                           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP Request
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        MIDDLEWARES & ENTRADA                           │
│  - requireAuth (Sesión activa)                                         │
│  - requireGuest (Solo no autenticados)                                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌──────────────────────┐                         ┌───────────────────────┐
│ RUTAS PÚBLICAS       │                         │ RUTAS PROTEGIDAS      │
│ - GET / (Inicio)     │                         │ - GET /dashboard/*    │
│ - GET /quienes-somos │                         │ - CRUD /productos     │
│ - GET /productos     │                         │ - CRUD /categorias    │
│ - GET /login         │                         │ - CRUD /ventas        │
│ - GET /registro      │                         │ - CRUD /usuarios      │
└──────────────────────┘                         └───────────┬───────────┘
                                                             │
                                                             ▼
                                                 ┌───────────────────────┐
                                                 │ POLICIES & GATES      │
                                                 │ - UsuarioPolicy       │
                                                 │ - ProductoPolicy      │
                                                 │ - CategoriaPolicy     │
                                                 │ - VentaPolicy         │
                                                 └───────────┬───────────┘
                                                             │
                                                             ▼
                                                 ┌───────────────────────┐
                                                 │ BITÁCORAS AAA (Log)   │
                                                 │ storage/logs/         │
                                                 │ - autenticacion.log   │
                                                 │ - productos.log       │
                                                 │ - ventas.log          │
                                                 └───────────────────────┘
```

#### Reglas de Validación de Políticas a Garantizar
1. **`UsuarioPolicy`**:
   - `create`: Solo `administrador`.
   - `update`: `administrador` puede editar a todos; `gerente` solo puede editar a usuarios con `rol === 'cliente'` (bloqueo automático si intenta editar a otro gerente o administrador).
   - `delete`: Solo `administrador` (no a sí mismo).
2. **`ProductoPolicy`**:
   - `create`: `administrador` y `gerente`.
   - `update` / `delete`: `administrador` o `gerente` propietario del producto (`usuario_id === user.id`).
3. **`CategoriaPolicy`**:
   - `create` / `update`: `administrador` y `gerente`.
   - `delete`: Solo `administrador`.
4. **`VentaPolicy`**:
   - `viewAny`: `administrador` y `gerente`.
   - `create`: `cliente` autenticado (o personal de venta).
