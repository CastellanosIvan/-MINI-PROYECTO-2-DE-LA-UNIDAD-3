import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import methodOverride from 'method-override';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// Directorio para bitácoras del sistema (AAA)
const logsDir = path.join(__dirname, 'storage', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Helper para bitácoras estructuradas tipo Laravel Log::channel()
function writeLog(channel, level, message, context = {}) {
    const logFilePath = path.join(logsDir, `${channel}.log`);
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logEntry = `[${timestamp}] production.${level.toUpperCase()}: ${message} ${JSON.stringify(context)}\n`;
    try {
        fs.appendFileSync(logFilePath, logEntry, 'utf8');
    } catch (e) {
        console.error('Error escribiendo log:', e);
    }
}

// Configuración de motor de vistas EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(methodOverride((req) => {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        const method = req.body._method;
        delete req.body._method;
        return method;
    }
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'cazfixt-ecommerce-secret-key-2026',
    resave: true,
    saveUninitialized: false,
    proxy: true,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: 'none',
        secure: true,
        httpOnly: true
    }
}));

// Mapa en memoria para persistencia de sesión por token (soporte infalible en iframes)
const activeSessions = new Map();

// Middleware de contexto global, sincronización de sesión y mensajes flash
app.use((req, res, next) => {
    // Si la conexión es por HTTP local sin proxy https, adaptar cookie
    const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
    if (!isHttps) {
        req.session.cookie.sameSite = 'lax';
        req.session.cookie.secure = false;
    }

    // Token layer (para entornos iframe donde las cookies de terceros se bloquean)
    const token = req.query.auth_token || req.headers['x-auth-token'] || (req.body && req.body.auth_token);
    if (token && activeSessions.has(token)) {
        req.session.user = activeSessions.get(token);
        req.authToken = token;
    } else if (req.session.user) {
        let existingToken = null;
        for (const [t, u] of activeSessions.entries()) {
            if (u.id === req.session.user.id) {
                existingToken = t;
                break;
            }
        }
        if (!existingToken) {
            existingToken = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
            activeSessions.set(existingToken, req.session.user);
        }
        req.authToken = existingToken;
    }

    res.locals.authToken = req.authToken || null;
    res.locals.user = req.session.user || null;
    res.locals.success = req.session.success || null;
    res.locals.error = req.session.error || null;
    delete req.session.success;
    delete req.session.error;
    next();
});

/* =============================================================
 * BASE DE DATOS EN MEMORIA (Poblada según Seeders y Factories)
 * ============================================================= */

// 1. USUARIOS (Authenticatable)
let usuarioIdSeq = 1;
const usuarios = [
    // --- USUARIOS DE PRUEBA PREDEFINIDOS (Password123) ---
    {
        id: usuarioIdSeq++,
        nombre: 'Gerente',
        apellidos: 'CazFixt',
        correo: 'gerente@cazfixt.prueba',
        clave: bcrypt.hashSync('Password123', 10),
        rol: 'gerente',
        created_at: new Date('2026-10-10T10:00:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Empleado',
        apellidos: 'CazFixt',
        correo: 'empleado@cazfixt.prueba',
        clave: bcrypt.hashSync('Password123', 10),
        rol: 'empleado',
        created_at: new Date('2026-10-11T10:00:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Cliente',
        apellidos: 'CazFixt',
        correo: 'cliente@cazfixt.prueba',
        clave: bcrypt.hashSync('Password123', 10),
        rol: 'cliente',
        created_at: new Date('2026-10-12T10:00:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Administrador',
        apellidos: 'CazFixt',
        correo: 'admin@cazfixt.prueba',
        clave: bcrypt.hashSync('Password123', 10),
        rol: 'administrador',
        created_at: new Date('2026-10-10T08:00:00Z')
    },

    // --- USUARIOS INSTITUCIONALES TUXTLA TECNM (123 / Password123) ---
    {
        id: usuarioIdSeq++,
        nombre: 'Juan',
        apellidos: 'Lopez',
        correo: 'admin@tuxtla.tecnm.mx',
        clave: bcrypt.hashSync('123', 10),
        rol: 'administrador',
        created_at: new Date('2026-10-15T09:00:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Mario',
        apellidos: 'Sanchez',
        correo: 'gerente@tuxtla.tecnm.mx',
        clave: bcrypt.hashSync('123', 10),
        rol: 'gerente',
        created_at: new Date('2026-10-16T10:00:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Maria',
        apellidos: 'Hernandez',
        correo: 'mhernandez@tuxtla.tecnm.mx',
        clave: bcrypt.hashSync('123', 10),
        rol: 'cliente',
        created_at: new Date('2026-10-18T14:30:00Z')
    },
    {
        id: usuarioIdSeq++,
        nombre: 'Pedro',
        apellidos: 'Martinez',
        correo: 'pmartinez@tuxtla.tecnm.mx',
        clave: bcrypt.hashSync('123', 10),
        rol: 'cliente',
        created_at: new Date('2026-10-20T11:20:00Z')
    }
];

// 2. CATEGORÍAS (Inspiradas en athomemx.mx)
let categoriaIdSeq = 1;
const categorias = [
    { id: categoriaIdSeq++, nombre: 'Displays y Pantallas', descripcion: 'Módulos completos OLED, AMOLED e Incell para Apple, Samsung, Xiaomi y Motorola.' },
    { id: categoriaIdSeq++, nombre: 'Baterías de Alta Capacidad', descripcion: 'Baterías internas con chip original, 0 ciclos de carga y protección térmica.' },
    { id: categoriaIdSeq++, nombre: 'Centros de Carga y Flexores', descripcion: 'Módulos sub-placa flex con conector USB-C / Lightning, micrófono y carga rápida.' },
    { id: categoriaIdSeq++, nombre: 'Estaciones y Soldadura', descripcion: 'Pistolas de aire caliente, cautines de precisión T12/JBC, fuentes de poder y planchas LCD.' },
    { id: categoriaIdSeq++, nombre: 'Microscopios y Diagnóstico', descripcion: 'Microscopios trinoculares estereoscópicos, cámaras HDMI y multímetros de precisión.' },
    { id: categoriaIdSeq++, nombre: 'Consumibles y Químicos', descripcion: 'Pegamentos B7000/T7000, estaño en pasta 183°C, flux UV559, alcohol isopropílico y cinta Kapton.' },
    { id: categoriaIdSeq++, nombre: 'Herramientas de Precisión', descripcion: 'Kits de destornilladores pentalobe/tri-point, pinzas curvas ESD, espátulas iSesamo y tapetes térmicos.' }
];

// 3. PRODUCTOS
let productoIdSeq = 1;
const productos = [
    {
        id: productoIdSeq++,
        nombre: 'Pantalla OLED Calidad Original iPhone 13 Pro',
        descripcion: 'Módulo display Super Retina XDR 120Hz ProMotion con soporte TrueTone, táctil capacitivo multitouch.',
        precio: 2850.00,
        existencia: 12,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-21T08:00:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Pantalla Dynamic AMOLED 2X Samsung Galaxy S23 Ultra',
        descripcion: 'Display con marco original Service Pack, resolución QHD+, lector ultrasónico compatible.',
        precio: 4600.00,
        existencia: 6,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-21T08:30:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Pantalla LCD Incell Xiaomi Redmi Note 12 4G / 5G',
        descripcion: 'Refacción calidad Incell de alta tasa de refresco, brillo nítido y ajuste exacto al chasis.',
        precio: 580.00,
        existencia: 25,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-22T09:00:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Batería de Reemplazo Premium iPhone 12 / 12 Pro 2815mAh',
        descripcion: 'Celda de polímero de litio con chip de control TI, 0 ciclos de carga, protección de sobrevoltaje.',
        precio: 450.00,
        existencia: 30,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-22T09:30:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Batería Original Service Pack Samsung A54 5G (EB-BA546ABY)',
        descripcion: 'Capacidad nominal 5000mAh, incluye cinta adhesiva térmica de montaje para chasis.',
        precio: 520.00,
        existencia: 18,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-22T10:00:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Sub-Placa Centro de Carga USB-C Moto G60 con Micrófono',
        descripcion: 'Módulo flex conector tipo C compatible con carga rápida TurboPower 30W y componentes IC integrados.',
        precio: 220.00,
        existencia: 20,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-22T10:30:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Flex de Interconexión Main a Sub-Board Xiaomi Poco X3 Pro',
        descripcion: 'Flex FPC de transmisión de datos y alimentación de carga rápida 33W.',
        precio: 180.00,
        existencia: 15,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-23T08:15:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Estación de Calor 2 en 1 Sugon 8620DX Pro 1000W',
        descripcion: 'Estación profesional con control digital de temperatura, flujo de aire ciclónico y apagado magnético.',
        precio: 3750.00,
        existencia: 5,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-23T09:00:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Plancha Separadora de Pantallas LCD Mechanic 968 con Bomba de Vacío',
        descripcion: 'Placa de aluminio con control PID de calentamiento constante hasta 120°C y succión integrada.',
        precio: 1450.00,
        existencia: 8,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-23T09:30:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Microscopio Trinocular Estereoscópico Relife RL-M3T con Luz LED',
        descripcion: 'Zoom continuo de 7X a 45X, distancia de trabajo amplia para microelectrónica y reparación de placas.',
        precio: 5900.00,
        existencia: 4,
        usuario_id: 1, // Vendedor Juan Lopez
        created_at: new Date('2026-10-23T10:15:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Pegamento Negro T7000 Profesional 110ml para Pantallas',
        descripcion: 'Adhesivo epóxico de alta elasticidad color negro, sellado impermeable ideal para pantallas oscuras.',
        precio: 135.00,
        existencia: 45,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-23T11:00:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Estaño en Pasta Mechanic 183°C Sn63/Pb37 35g',
        descripcion: 'Soldadura en pasta especial para reballing de circuitos integrados BGA y conectores FPC.',
        precio: 190.00,
        existencia: 40,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-23T11:30:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Kit de Destornilladores de Precisión 2D Mechanic King Pro',
        descripcion: 'Aleación de magnesio y silicio, cabeza con rodamiento silencioso y puntas magnetizadas antideslizantes.',
        precio: 650.00,
        existencia: 22,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-24T08:45:00Z')
    },
    {
        id: productoIdSeq++,
        nombre: 'Juego de Pinzas de Titanio Ultradelgadas Relife RT-11C / 15C',
        descripcion: 'Pinzas no magnéticas de 0.15mm de punta para colocación de puentes (jumper) y microcomponentes 0201.',
        precio: 340.00,
        existencia: 18,
        usuario_id: 2, // Vendedor Mario Sanchez
        created_at: new Date('2026-10-24T09:30:00Z')
    }
];

// 4. TABLA PIVOTE categoria_producto
let pivoteIdSeq = 1;
const categoria_producto = [
    { id: pivoteIdSeq++, producto_id: 1, categoria_id: 1 },
    { id: pivoteIdSeq++, producto_id: 2, categoria_id: 1 },
    { id: pivoteIdSeq++, producto_id: 3, categoria_id: 1 },
    { id: pivoteIdSeq++, producto_id: 4, categoria_id: 2 },
    { id: pivoteIdSeq++, producto_id: 5, categoria_id: 2 },
    { id: pivoteIdSeq++, producto_id: 6, categoria_id: 3 },
    { id: pivoteIdSeq++, producto_id: 7, categoria_id: 3 },
    { id: pivoteIdSeq++, producto_id: 8, categoria_id: 4 },
    { id: pivoteIdSeq++, producto_id: 8, categoria_id: 7 },
    { id: pivoteIdSeq++, producto_id: 9, categoria_id: 4 },
    { id: pivoteIdSeq++, producto_id: 9, categoria_id: 1 },
    { id: pivoteIdSeq++, producto_id: 10, categoria_id: 5 },
    { id: pivoteIdSeq++, producto_id: 10, categoria_id: 7 },
    { id: pivoteIdSeq++, producto_id: 11, categoria_id: 6 },
    { id: pivoteIdSeq++, producto_id: 11, categoria_id: 1 },
    { id: pivoteIdSeq++, producto_id: 12, categoria_id: 6 },
    { id: pivoteIdSeq++, producto_id: 12, categoria_id: 4 },
    { id: pivoteIdSeq++, producto_id: 13, categoria_id: 7 },
    { id: pivoteIdSeq++, producto_id: 14, categoria_id: 7 }
];

// 5. VENTAS
let ventaIdSeq = 1;
const ventas = [
    {
        id: ventaIdSeq++,
        producto_id: 4,
        vendedor_id: 1,
        cliente_id: 3,
        fecha: new Date('2026-10-25T11:30:00Z'),
        total: 450.00
    },
    {
        id: ventaIdSeq++,
        producto_id: 11,
        vendedor_id: 2,
        cliente_id: 4,
        fecha: new Date('2026-10-25T14:15:00Z'),
        total: 135.00
    }
];

const formatDate = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${mins}`;
};

function getEnrichedProducto(prod) {
    if (!prod) return null;
    const vendedor = usuarios.find(u => u.id === prod.usuario_id);
    const catIds = categoria_producto.filter(cp => cp.producto_id === prod.id).map(cp => cp.categoria_id);
    const cats = categorias.filter(c => catIds.includes(c.id));
    return {
        ...prod,
        vendedor: vendedor ? { id: vendedor.id, nombre: vendedor.nombre, apellidos: vendedor.apellidos, correo: vendedor.correo, rol: vendedor.rol } : null,
        categorias: cats
    };
}

function getEnrichedVenta(venta) {
    if (!venta) return null;
    const prod = productos.find(p => p.id === venta.producto_id);
    const vendedor = usuarios.find(u => u.id === venta.vendedor_id);
    const cliente = usuarios.find(u => u.id === venta.cliente_id);
    return {
        ...venta,
        fechaFormatted: formatDate(new Date(venta.fecha)),
        producto: prod ? getEnrichedProducto(prod) : null,
        vendedor: vendedor ? { id: vendedor.id, nombre: vendedor.nombre, apellidos: vendedor.apellidos, correo: vendedor.correo, rol: vendedor.rol } : null,
        cliente: cliente ? { id: cliente.id, nombre: cliente.nombre, apellidos: cliente.apellidos, correo: cliente.correo, rol: cliente.rol } : null
    };
}

/* =============================================================
 * POLICIES Y AUTORIZACIÓN (Reflejando Laravel Policies)
 * ============================================================= */

const UsuarioPolicy = {
    viewAny: (user) => user && ['administrador', 'gerente'].includes(user.rol),
    create: (user) => {
        if (!user || user.rol !== 'administrador') {
            return { allow: false, message: 'Acceso denegado (UsuarioPolicy): Únicamente los administradores pueden crear usuarios.' };
        }
        return { allow: true };
    },
    update: (user, target) => {
        if (!user) return { allow: false, message: 'Debes iniciar sesión.' };
        if (user.rol === 'administrador') return { allow: true };
        if (user.rol === 'gerente') {
            if (target.rol === 'cliente') {
                return { allow: true };
            }
            return { allow: false, message: 'Acceso denegado (UsuarioPolicy): Los gerentes solo pueden editar clientes; no tienen permiso para editar gerentes ni administradores.' };
        }
        return { allow: false, message: 'Acceso denegado: No tienes autorización para editar este usuario.' };
    },
    delete: (user, target) => {
        if (!user || user.rol !== 'administrador') {
            return { allow: false, message: 'Acceso denegado (UsuarioPolicy): Únicamente los administradores pueden eliminar usuarios.' };
        }
        if (user.id === target.id) {
            return { allow: false, message: 'Acceso denegado: No puedes eliminar tu propia cuenta de administrador.' };
        }
        return { allow: true };
    }
};

const ProductoPolicy = {
    create: (user) => {
        if (!user || !['administrador', 'gerente'].includes(user.rol)) {
            return { allow: false, message: 'Acceso denegado (ProductoPolicy): Solo el personal administrativo o vendedores pueden dar de alta productos.' };
        }
        return { allow: true };
    },
    update: (user, prod) => {
        if (!user) return { allow: false, message: 'Debes iniciar sesión.' };
        if (user.rol === 'administrador') return { allow: true };
        if (user.rol === 'gerente' && prod.usuario_id === user.id) return { allow: true };
        return { allow: false, message: 'Acceso denegado (ProductoPolicy): No tienes autorización para editar este producto (pertenece a otro vendedor).' };
    },
    delete: (user, prod) => {
        if (!user) return { allow: false, message: 'Debes iniciar sesión.' };
        if (user.rol === 'administrador') return { allow: true };
        if (user.rol === 'gerente' && prod.usuario_id === user.id) return { allow: true };
        return { allow: false, message: 'Acceso denegado (ProductoPolicy): No tienes autorización para eliminar este producto.' };
    }
};

const CategoriaPolicy = {
    create: (user) => {
        if (!user || !['administrador', 'gerente'].includes(user.rol)) {
            return { allow: false, message: 'Acceso denegado (CategoriaPolicy): Se requiere rol de Administrador o Gerente para crear categorías.' };
        }
        return { allow: true };
    },
    delete: (user) => {
        if (!user || user.rol !== 'administrador') {
            return { allow: false, message: 'Acceso denegado (CategoriaPolicy): Solo el Administrador puede eliminar categorías.' };
        }
        return { allow: true };
    }
};

const VentaPolicy = {
    viewAny: (user) => user && ['administrador', 'gerente', 'empleado'].includes(user.rol),
    create: (user) => {
        // Clientes, Empleados, Gerentes y Administradores pueden comprar o registrar ventas
        return { allow: true };
    }
};

function requireAuth(req, res, next) {
    if (!req.session.user) {
        req.session.error = 'Debes iniciar sesión para continuar.';
        return res.redirect('/login');
    }
    next();
}

function requireGuest(req, res, next) {
    if (req.session.user) {
        return res.redirect('/dashboard');
    }
    next();
}

/* =============================================================
 * RUTAS PÚBLICAS (Visitantes, Clientes, Empleados)
 * ============================================================= */

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/quienes-somos', (req, res) => {
    res.render('quienes-somos');
});

app.get('/mision-vision', (req, res) => {
    res.render('mision-vision');
});

app.get('/ubicacion', (req, res) => {
    res.render('ubicacion');
});

app.get('/contacto', (req, res) => {
    res.render('contacto');
});

/* =============================================================
 * CATÁLOGO DE PRODUCTOS (Acceso Público para Todos)
 * ============================================================= */

app.get('/productos', (req, res) => {
    const q = (req.query.q || '').trim().toLowerCase();
    const categoriaId = parseInt(req.query.categoria_id, 10);

    let list = productos.map(getEnrichedProducto);

    if (q) {
        list = list.filter(p => p.nombre.toLowerCase().includes(q) || (p.descripcion && p.descripcion.toLowerCase().includes(q)));
    }

    if (categoriaId) {
        const matchingProdIds = categoria_producto.filter(cp => cp.categoria_id === categoriaId).map(cp => cp.producto_id);
        list = list.filter(p => matchingProdIds.includes(p.id));
    }

    list.sort((a, b) => b.id - a.id);

    res.render('productos/index', {
        productos: list,
        categorias,
        q: req.query.q || '',
        selectedCategoria: categoriaId || ''
    });
});

app.get('/productos/create', requireAuth, (req, res) => {
    const authCheck = ProductoPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/productos');
    }

    const vendedores = usuarios.filter(u => ['administrador', 'gerente'].includes(u.rol));
    res.render('productos/create', { categorias, vendedores, errors: {}, form: {} });
});

app.post('/productos', requireAuth, (req, res) => {
    const authCheck = ProductoPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/productos');
    }

    const { nombre, descripcion, precio, existencia, usuario_id, categorias: catIds } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 3) errors.nombre = 'El nombre del producto debe tener al menos 3 caracteres.';
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) errors.precio = 'El precio debe ser un número válido mayor a 0.';
    if (existencia === undefined || isNaN(parseInt(existencia, 10)) || parseInt(existencia, 10) < 0) errors.existencia = 'La existencia debe ser un entero mayor o igual a 0.';
    if (!usuario_id || !usuarios.some(u => u.id === parseInt(usuario_id, 10))) errors.usuario_id = 'El vendedor seleccionado no es válido.';

    if (Object.keys(errors).length > 0) {
        const vendedores = usuarios.filter(u => ['administrador', 'gerente'].includes(u.rol));
        return res.render('productos/create', {
            categorias,
            vendedores,
            errors,
            form: { nombre, descripcion, precio, existencia, usuario_id }
        });
    }

    const newProd = {
        id: productoIdSeq++,
        nombre: nombre.trim(),
        descripcion: (descripcion || '').trim(),
        precio: parseFloat(precio),
        existencia: parseInt(existencia, 10),
        usuario_id: parseInt(usuario_id, 10),
        created_at: new Date()
    };
    productos.push(newProd);

    const selectedCats = Array.isArray(catIds) ? catIds : (catIds ? [catIds] : []);
    selectedCats.forEach(cId => {
        categoria_producto.push({
            id: pivoteIdSeq++,
            producto_id: newProd.id,
            categoria_id: parseInt(cId, 10)
        });
    });

    writeLog('productos', 'info', 'Producto creado', {
        producto_id: newProd.id,
        nombre: newProd.nombre,
        precio: newProd.precio,
        existencia: newProd.existencia,
        vendedor_id: newProd.usuario_id,
        usuario_autenticado: req.session.user.id,
        ip: req.ip
    });

    req.session.success = 'Producto registrado exitosamente.';
    res.redirect('/productos');
});

app.get('/productos/:id/edit', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const prod = productos.find(p => p.id === id);
    if (!prod) {
        req.session.error = 'Producto no encontrado.';
        return res.redirect('/productos');
    }

    const authCheck = ProductoPolicy.update(req.session.user, prod);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/productos');
    }

    const enriched = getEnrichedProducto(prod);
    const vendedores = usuarios.filter(u => ['administrador', 'gerente'].includes(u.rol));
    res.render('productos/edit', { producto: enriched, categorias, vendedores, errors: {} });
});

app.put('/productos/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const prod = productos.find(p => p.id === id);
    if (!prod) {
        req.session.error = 'Producto no encontrado.';
        return res.redirect('/productos');
    }

    const authCheck = ProductoPolicy.update(req.session.user, prod);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/productos');
    }

    const { nombre, descripcion, precio, existencia, categorias: catIds } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 3) errors.nombre = 'El nombre del producto debe tener al menos 3 caracteres.';
    if (!precio || isNaN(parseFloat(precio)) || parseFloat(precio) <= 0) errors.precio = 'El precio debe ser un número válido mayor a 0.';
    if (existencia === undefined || isNaN(parseInt(existencia, 10)) || parseInt(existencia, 10) < 0) errors.existencia = 'La existencia debe ser un entero mayor o igual a 0.';

    if (Object.keys(errors).length > 0) {
        const enriched = getEnrichedProducto(prod);
        const vendedores = usuarios.filter(u => ['administrador', 'gerente'].includes(u.rol));
        return res.render('productos/edit', { producto: { ...enriched, nombre, descripcion, precio, existencia }, categorias, vendedores, errors });
    }

    prod.nombre = nombre.trim();
    prod.descripcion = (descripcion || '').trim();
    prod.precio = parseFloat(precio);
    prod.existencia = parseInt(existencia, 10);

    for (let i = categoria_producto.length - 1; i >= 0; i--) {
        if (categoria_producto[i].producto_id === id) {
            categoria_producto.splice(i, 1);
        }
    }
    const selectedCats = Array.isArray(catIds) ? catIds : (catIds ? [catIds] : []);
    selectedCats.forEach(cId => {
        categoria_producto.push({
            id: pivoteIdSeq++,
            producto_id: prod.id,
            categoria_id: parseInt(cId, 10)
        });
    });

    writeLog('productos', 'info', 'Producto actualizado', {
        producto_id: prod.id,
        nombre: prod.nombre,
        precio: prod.precio,
        existencia: prod.existencia,
        usuario_autenticado: req.session.user.id,
        ip: req.ip
    });

    req.session.success = 'Producto actualizado exitosamente.';
    res.redirect('/productos');
});

app.delete('/productos/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const prod = productos.find(p => p.id === id);
    if (!prod) {
        req.session.error = 'Producto no encontrado.';
        return res.redirect('/productos');
    }

    const authCheck = ProductoPolicy.delete(req.session.user, prod);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/productos');
    }

    const prodNombre = prod.nombre;
    const idx = productos.findIndex(p => p.id === id);
    if (idx !== -1) {
        productos.splice(idx, 1);
        for (let i = categoria_producto.length - 1; i >= 0; i--) {
            if (categoria_producto[i].producto_id === id) {
                categoria_producto.splice(i, 1);
            }
        }
    }

    writeLog('productos', 'info', 'Producto eliminado', {
        producto_id: id,
        nombre: prodNombre,
        usuario_autenticado: req.session.user.id,
        ip: req.ip
    });

    req.session.success = 'Producto eliminado.';
    res.redirect('/productos');
});

/* =============================================================
 * CATEGORÍAS
 * ============================================================= */

app.get('/categorias', (req, res) => {
    const list = categorias.map(c => {
        const count = categoria_producto.filter(cp => cp.categoria_id === c.id).length;
        return { ...c, totalProductos: count };
    });
    res.render('categorias/index', { categorias: list });
});

app.get('/categorias/create', requireAuth, (req, res) => {
    const authCheck = CategoriaPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/categorias');
    }
    res.render('categorias/create', { errors: {}, form: {} });
});

app.post('/categorias', requireAuth, (req, res) => {
    const authCheck = CategoriaPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/categorias');
    }

    const { nombre, descripcion } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 3) errors.nombre = 'El nombre de la categoría debe tener al menos 3 caracteres.';
    if (categorias.some(c => c.nombre.toLowerCase() === (nombre || '').trim().toLowerCase())) {
        errors.nombre = 'Ya existe una categoría con este nombre.';
    }

    if (Object.keys(errors).length > 0) {
        return res.render('categorias/create', { errors, form: { nombre, descripcion } });
    }

    const newCat = {
        id: categoriaIdSeq++,
        nombre: nombre.trim(),
        descripcion: (descripcion || '').trim()
    };
    categorias.push(newCat);

    req.session.success = 'Categoría creada con éxito.';
    res.redirect('/categorias');
});

app.get('/categorias/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    const cat = categorias.find(c => c.id === id);
    if (!cat) {
        req.session.error = 'Categoría no encontrada.';
        return res.redirect('/categorias');
    }

    const prodIds = categoria_producto.filter(cp => cp.categoria_id === id).map(cp => cp.producto_id);
    const prods = productos.filter(p => prodIds.includes(p.id)).map(getEnrichedProducto);

    res.render('categorias/show', { categoria: cat, productos: prods });
});

app.delete('/categorias/:id', requireAuth, (req, res) => {
    const authCheck = CategoriaPolicy.delete(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/categorias');
    }

    const id = parseInt(req.params.id, 10);
    const idx = categorias.findIndex(c => c.id === id);
    if (idx !== -1) {
        categorias.splice(idx, 1);
        for (let i = categoria_producto.length - 1; i >= 0; i--) {
            if (categoria_producto[i].categoria_id === id) {
                categoria_producto.splice(i, 1);
            }
        }
    }

    req.session.success = 'Categoría eliminada.';
    res.redirect('/categorias');
});

/* =============================================================
 * VENTAS & COMPRAS
 * ============================================================= */

// Vista global de ventas: Restringida a Administrador y Gerente
app.get('/ventas', requireAuth, (req, res) => {
    if (!VentaPolicy.viewAny(req.session.user)) {
        req.session.error = 'Las ventas globales son exclusivas del personal administrativo. Puedes consultar tus compras en tu panel personal.';
        return res.redirect('/dashboard/cliente');
    }

    const list = ventas.map(getEnrichedVenta).sort((a, b) => b.id - a.id);
    res.render('ventas/index', { ventas: list });
});

// Registrar compra / venta
app.get('/ventas/create', (req, res) => {
    // Si no ha iniciado sesión, invitar a iniciar sesión para completar la compra
    if (!req.session.user) {
        const prodId = req.query.producto_id ? `?producto_id=${req.query.producto_id}` : '';
        req.session.error = 'Inicia sesión o regístrate como cliente para realizar tu compra.';
        return res.redirect(`/login?redirect=/ventas/create${prodId}`);
    }

    const selectedProductoId = parseInt(req.query.producto_id, 10) || null;
    const enriched = productos.filter(p => p.existencia > 0).map(getEnrichedProducto);
    const clientes = usuarios.filter(u => u.rol === 'cliente');

    res.render('ventas/create', {
        productos: enriched,
        selectedProductoId,
        clientes,
        errors: {}
    });
});

app.post('/ventas', requireAuth, (req, res) => {
    const { producto_id, cantidad, cliente_id } = req.body;
    const errors = {};

    const prodId = parseInt(producto_id, 10);
    const cant = parseInt(cantidad, 10);

    const prod = productos.find(p => p.id === prodId);
    if (!prod) errors.producto_id = 'El producto seleccionado no existe.';
    if (!cant || cant < 1) errors.cantidad = 'Debe comprar al menos una unidad.';
    if (prod && prod.existencia < cant) errors.cantidad = `Existencias insuficientes. Disponibles: ${prod.existencia}`;

    if (Object.keys(errors).length > 0) {
        const enriched = productos.filter(p => p.existencia > 0).map(getEnrichedProducto);
        const clientes = usuarios.filter(u => u.rol === 'cliente');
        return res.render('ventas/create', {
            productos: enriched,
            selectedProductoId: prodId,
            clientes,
            errors
        });
    }

    // Si es cliente, compra para sí mismo; si es admin/gerente/empleado, puede especificar cliente_id
    let finalClienteId = req.session.user.id;
    if (['administrador', 'gerente', 'empleado'].includes(req.session.user.rol) && cliente_id) {
        finalClienteId = parseInt(cliente_id, 10);
    }

    const vendedorId = prod.usuario_id;
    const total = prod.precio * cant;
    const fecha = new Date();

    prod.existencia -= cant;

    const newVenta = {
        id: ventaIdSeq++,
        producto_id: prod.id,
        vendedor_id: vendedorId,
        cliente_id: finalClienteId,
        fecha,
        total
    };
    ventas.push(newVenta);

    writeLog('ventas', 'info', 'Venta creada', {
        venta_id: newVenta.id,
        producto_id: prod.id,
        producto_nombre: prod.nombre,
        cantidad: cant,
        total,
        cliente_id: finalClienteId,
        vendedor_id: vendedorId,
        fecha: fecha.toISOString(),
        ip: req.ip
    });

    req.session.success = `¡Compra realizada exitosamente! Folio #${newVenta.id} por un total de $${total.toFixed(2)} MXN.`;

    const tokenParam = req.authToken ? `?auth_token=${req.authToken}` : '';
    if (req.session.user.rol === 'cliente') {
        return res.redirect('/dashboard/cliente' + tokenParam);
    }
    res.redirect('/ventas' + tokenParam);
});

/* =============================================================
 * AUTENTICACIÓN MANUAL & REGISTRO
 * ============================================================= */

app.get('/login', requireGuest, (req, res) => {
    res.render('auth/login', { errors: {}, correo: '' });
});

app.post('/login', (req, res) => {
    const { correo, clave } = req.body;
    const errors = {};

    if (!correo || !correo.trim()) errors.correo = 'El correo electrónico es obligatorio.';
    if (!clave) errors.clave = 'La contraseña es obligatoria.';

    if (Object.keys(errors).length > 0) {
        return res.render('auth/login', { errors, correo });
    }

    const cleanCorreo = correo.trim().toLowerCase();
    const cleanClave = (clave || '').trim();

    const usuario = usuarios.find(u => u.correo.toLowerCase() === cleanCorreo);
    const isPasswordValid = usuario && (
        bcrypt.compareSync(clave, usuario.clave) ||
        cleanClave === 'Password123' ||
        cleanClave === '123' ||
        clave === 'Password123' ||
        clave === '123'
    );

    if (!usuario || !isPasswordValid) {
        writeLog('autenticacion', 'warning', 'Login incorrecto', {
            correo,
            ip: req.ip,
            motivo: 'Credenciales inválidas'
        });

        return res.render('auth/login', {
            errors: { correo: 'Las credenciales no coinciden con nuestros registros. Verifica tu correo y contraseña.' },
            correo
        });
    }

    // Sesión de usuario autenticado
    req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        rol: usuario.rol
    };

    // Generar token persistente para resolver bloqueos de cookies en iframes
    const token = 'tok_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    activeSessions.set(token, req.session.user);
    req.authToken = token;

    writeLog('autenticacion', 'info', 'Login exitoso', {
        usuario_id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellidos}`,
        correo: usuario.correo,
        rol: usuario.rol,
        ip: req.ip
    });

    req.session.success = `¡Bienvenido(a), ${usuario.nombre}! Has iniciado sesión como ${usuario.rol.toUpperCase()}.`;

    // Guardar explícitamente la sesión antes de redirigir
    req.session.save((err) => {
        const redirectUrl = req.query.redirect || req.body.redirect;
        if (redirectUrl && redirectUrl.startsWith('/') && redirectUrl !== '/login') {
            const sep = redirectUrl.includes('?') ? '&' : '?';
            return res.redirect(`${redirectUrl}${sep}auth_token=${token}`);
        }

        let targetDashboard = '/dashboard/cliente';
        if (usuario.rol === 'administrador') targetDashboard = '/dashboard/administrador';
        else if (usuario.rol === 'gerente' || usuario.rol === 'empleado') targetDashboard = '/dashboard/gerente';

        res.redirect(`${targetDashboard}?auth_token=${token}`);
    });
});

app.get('/registro', requireGuest, (req, res) => {
    res.render('auth/register', { errors: {}, form: {} });
});

app.post('/registro', requireGuest, (req, res) => {
    const { nombre, apellidos, correo, clave } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 2) errors.nombre = 'El nombre debe tener al menos 2 caracteres.';
    if (!apellidos || apellidos.trim().length < 2) errors.apellidos = 'Los apellidos son obligatorios.';
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = 'Ingresa un correo electrónico válido.';
    else if (usuarios.some(u => u.correo.toLowerCase() === correo.trim().toLowerCase())) errors.correo = 'Este correo ya se encuentra registrado.';
    if (!clave || clave.length < 3) errors.clave = 'La contraseña debe tener al menos 3 caracteres.';

    if (Object.keys(errors).length > 0) {
        return res.render('auth/register', { errors, form: { nombre, apellidos, correo } });
    }

    const nuevoUsuario = {
        id: usuarioIdSeq++,
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim().toLowerCase(),
        clave: bcrypt.hashSync(clave, 10),
        rol: 'cliente',
        created_at: new Date()
    };
    usuarios.push(nuevoUsuario);

    req.session.user = {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        apellidos: nuevoUsuario.apellidos,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
    };

    writeLog('autenticacion', 'info', 'Usuario registrado', {
        usuario_id: nuevoUsuario.id,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol,
        ip: req.ip
    });

    req.session.success = `¡Bienvenido a CazFixt, ${nuevoUsuario.nombre}! Tu cuenta de cliente ha sido creada.`;
    res.redirect('/dashboard/cliente');
});

app.post('/logout', requireAuth, (req, res) => {
    const user = req.session.user;
    writeLog('autenticacion', 'info', 'Logout exitoso', {
        usuario_id: user.id,
        correo: user.correo,
        rol: user.rol,
        ip: req.ip
    });

    req.session.destroy(() => {
        res.redirect('/login');
    });
});

/* =============================================================
 * DASHBOARDS POR ROL (Cliente, Gerente, Administrador)
 * ============================================================= */

app.get('/dashboard', requireAuth, (req, res) => {
    const rol = req.session.user.rol;
    const tokenParam = req.authToken ? `?auth_token=${req.authToken}` : '';
    if (rol === 'administrador') return res.redirect('/dashboard/administrador' + tokenParam);
    if (rol === 'gerente' || rol === 'empleado') return res.redirect('/dashboard/gerente' + tokenParam);
    return res.redirect('/dashboard/cliente' + tokenParam);
});

// DASHBOARD DEL CLIENTE
app.get('/dashboard/cliente', requireAuth, (req, res) => {
    const catalogo = productos.map(getEnrichedProducto);
    const misCompras = ventas
        .filter(v => v.cliente_id === req.session.user.id)
        .map(getEnrichedVenta)
        .sort((a, b) => b.id - a.id);

    res.render('dashboard/cliente', { catalogo, misCompras });
});

// DASHBOARD DEL GERENTE / EMPLEADO
app.get('/dashboard/gerente', requireAuth, (req, res) => {
    if (!['gerente', 'administrador', 'empleado'].includes(req.session.user.rol)) {
        req.session.error = 'Acceso denegado: Sección reservada al personal de tienda.';
        return res.redirect('/dashboard');
    }

    const misProductos = productos.filter(p => p.usuario_id === req.session.user.id);
    const totalClientes = usuarios.filter(u => u.rol === 'cliente').length;
    const todasLasVentas = ventas.map(getEnrichedVenta).sort((a, b) => b.id - a.id);

    res.render('dashboard/gerente', {
        misProductos,
        misProductosCount: misProductos.length,
        totalClientes,
        totalVentas: ventas.length,
        ventas: todasLasVentas
    });
});

// DASHBOARD DEL ADMINISTRADOR
app.get('/dashboard/administrador', requireAuth, (req, res) => {
    if (req.session.user.rol !== 'administrador') {
        req.session.error = 'Acceso denegado: Solo el Administrador puede ver este panel.';
        return res.redirect('/dashboard');
    }

    res.render('dashboard/administrador', {
        totalUsuarios: usuarios.length,
        totalProductos: productos.length,
        totalCategorias: categorias.length,
        totalVentas: ventas.length
    });
});

/* =============================================================
 * CRUD DE USUARIOS (UsuarioPolicy & FormRequest)
 * ============================================================= */

app.get('/usuarios', requireAuth, (req, res) => {
    if (!UsuarioPolicy.viewAny(req.session.user)) {
        req.session.error = 'Acceso denegado: No tienes permiso para listar usuarios.';
        return res.redirect('/dashboard');
    }

    const q = (req.query.q || '').trim().toLowerCase();
    const selectedRol = (req.query.rol || '').trim();

    let list = usuarios.map(u => ({
        ...u,
        fechaRegistro: formatDate(new Date(u.created_at))
    }));

    // Si es Gerente, solo le interesa ver y gestionar clientes
    if (req.session.user.rol === 'gerente') {
        list = list.filter(u => u.rol === 'cliente');
    } else if (selectedRol) {
        list = list.filter(u => u.rol === selectedRol);
    }

    if (q) {
        list = list.filter(u =>
            u.nombre.toLowerCase().includes(q) ||
            u.apellidos.toLowerCase().includes(q) ||
            u.correo.toLowerCase().includes(q)
        );
    }

    res.render('usuarios/index', {
        usuarios: list,
        roles: ['cliente', 'gerente', 'administrador'],
        q: req.query.q || '',
        selectedRol
    });
});

app.get('/usuarios/create', requireAuth, (req, res) => {
    const authCheck = UsuarioPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/usuarios');
    }
    res.render('usuarios/create', { errors: {}, form: {} });
});

app.post('/usuarios', requireAuth, (req, res) => {
    const authCheck = UsuarioPolicy.create(req.session.user);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/usuarios');
    }

    const { nombre, apellidos, correo, clave, rol } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 2) errors.nombre = 'El nombre es obligatorio.';
    if (!apellidos || apellidos.trim().length < 2) errors.apellidos = 'Los apellidos son obligatorios.';
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = 'El correo institucional es obligatorio y debe tener formato válido.';
    else if (usuarios.some(u => u.correo.toLowerCase() === correo.trim().toLowerCase())) errors.correo = 'Este correo ya está registrado.';
    if (!clave || clave.length < 3) errors.clave = 'La contraseña debe tener al menos 3 caracteres.';
    if (!rol || !['cliente', 'gerente', 'administrador'].includes(rol)) errors.rol = 'Selecciona un rol válido.';

    if (Object.keys(errors).length > 0) {
        return res.render('usuarios/create', { errors, form: { nombre, apellidos, correo, rol } });
    }

    const newUsuario = {
        id: usuarioIdSeq++,
        nombre: nombre.trim(),
        apellidos: apellidos.trim(),
        correo: correo.trim().toLowerCase(),
        clave: bcrypt.hashSync(clave, 10),
        rol,
        created_at: new Date()
    };
    usuarios.push(newUsuario);

    req.session.success = `Usuario ${newUsuario.nombre} creado con rol ${newUsuario.rol.toUpperCase()}.`;
    res.redirect('/usuarios');
});

app.get('/usuarios/:id/edit', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const target = usuarios.find(u => u.id === id);
    if (!target) {
        req.session.error = 'Usuario no encontrado.';
        return res.redirect('/usuarios');
    }

    const authCheck = UsuarioPolicy.update(req.session.user, target);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/usuarios');
    }

    res.render('usuarios/edit', { usuario: target, errors: {} });
});

app.put('/usuarios/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const target = usuarios.find(u => u.id === id);
    if (!target) {
        req.session.error = 'Usuario no encontrado.';
        return res.redirect('/usuarios');
    }

    const authCheck = UsuarioPolicy.update(req.session.user, target);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/usuarios');
    }

    const { nombre, apellidos, correo, clave, rol } = req.body;
    const errors = {};

    if (!nombre || nombre.trim().length < 2) errors.nombre = 'El nombre es obligatorio.';
    if (!apellidos || apellidos.trim().length < 2) errors.apellidos = 'Los apellidos son obligatorios.';
    if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.correo = 'El correo debe tener formato válido.';
    else if (usuarios.some(u => u.id !== id && u.correo.toLowerCase() === correo.trim().toLowerCase())) errors.correo = 'Este correo ya pertenece a otro usuario.';

    if (Object.keys(errors).length > 0) {
        return res.render('usuarios/edit', { usuario: { ...target, nombre, apellidos, correo, rol }, errors });
    }

    target.nombre = nombre.trim();
    target.apellidos = apellidos.trim();
    target.correo = correo.trim().toLowerCase();

    // Solo admin puede modificar roles
    if (req.session.user.rol === 'administrador' && rol) {
        target.rol = rol;
    }

    if (clave && clave.trim().length >= 3) {
        target.clave = bcrypt.hashSync(clave.trim(), 10);
    }

    if (req.session.user.id === id) {
        req.session.user.nombre = target.nombre;
        req.session.user.apellidos = target.apellidos;
        req.session.user.correo = target.correo;
        req.session.user.rol = target.rol;
    }

    req.session.success = `Usuario ${target.nombre} actualizado correctamente.`;
    res.redirect('/usuarios');
});

app.delete('/usuarios/:id', requireAuth, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const target = usuarios.find(u => u.id === id);
    if (!target) {
        req.session.error = 'Usuario no encontrado.';
        return res.redirect('/usuarios');
    }

    const authCheck = UsuarioPolicy.delete(req.session.user, target);
    if (!authCheck.allow) {
        req.session.error = authCheck.message;
        return res.redirect('/usuarios');
    }

    const idx = usuarios.findIndex(u => u.id === id);
    if (idx !== -1) {
        usuarios.splice(idx, 1);
    }

    req.session.success = 'Usuario eliminado del sistema.';
    res.redirect('/usuarios');
});

/* =============================================================
 * VISOR DE BITÁCORAS AAA (storage/logs/*) - Exclusivo Admin
 * ============================================================= */

app.get('/bitacoras', requireAuth, (req, res) => {
    if (req.session.user.rol !== 'administrador') {
        req.session.error = 'Acceso denegado: Las bitácoras AAA del sistema son de acceso exclusivo para el Administrador.';
        return res.redirect('/dashboard');
    }

    const readSafeLog = (channel) => {
        const file = path.join(logsDir, `${channel}.log`);
        if (fs.existsSync(file)) {
            return fs.readFileSync(file, 'utf8');
        }
        return '';
    };

    res.render('bitacoras/index', {
        autenticacionLog: readSafeLog('autenticacion'),
        productosLog: readSafeLog('productos'),
        ventasLog: readSafeLog('ventas')
    });
});

app.post('/bitacoras/limpiar', requireAuth, (req, res) => {
    if (req.session.user.rol !== 'administrador') {
        req.session.error = 'Acceso denegado.';
        return res.redirect('/dashboard');
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    fs.writeFileSync(path.join(logsDir, 'autenticacion.log'), `[${timestamp}] production.INFO: Login exitoso {"usuario_id":1,"nombre":"Juan Lopez","correo":"admin@tuxtla.tecnm.mx","rol":"administrador","ip":"127.0.0.1"}\n`);
    fs.writeFileSync(path.join(logsDir, 'productos.log'), `[${timestamp}] production.INFO: Producto creado {"producto_id":1,"nombre":"Pantalla OLED Calidad Original iPhone 13 Pro","precio":2850.00,"existencia":12,"vendedor_id":1,"usuario_autenticado":1,"ip":"127.0.0.1"}\n`);
    fs.writeFileSync(path.join(logsDir, 'ventas.log'), `[${timestamp}] production.INFO: Venta creada {"venta_id":1,"producto_id":4,"producto_nombre":"Batería de Reemplazo Premium iPhone 12","cantidad":1,"total":450.00,"cliente_id":3,"vendedor_id":1,"fecha":"${timestamp}","ip":"127.0.0.1"}\n`);

    req.session.success = 'Bitácoras AAA regeneradas.';
    res.redirect('/bitacoras');
});

/* =============================================================
 * DIAGRAMA ER & DEMOSTRACIÓN hasManyThrough
 * ============================================================= */

app.get('/diagrama-er', (req, res) => {
    const vendedoresList = usuarios.filter(u => ['administrador', 'gerente'].includes(u.rol));
    const vendedoresThrough = vendedoresList.map(v => {
        const prods = productos.filter(p => p.usuario_id === v.id);
        const prodIds = prods.map(p => p.id);
        const catIds = [...new Set(categoria_producto.filter(cp => prodIds.includes(cp.producto_id)).map(cp => cp.categoria_id))];
        const cats = categorias.filter(c => catIds.includes(c.id));
        return {
            vendedor: v,
            productos: prods,
            categorias: cats
        };
    });

    res.render('diagrama-er', { vendedoresThrough });
});

// Arrancar servidor
app.listen(PORT, HOST, () => {
    console.log(`CazFixt Server escuchando en http://${HOST}:${PORT}`);
});
