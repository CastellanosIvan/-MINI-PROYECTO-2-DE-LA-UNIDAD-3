<?php

namespace Database\Seeders;

use App\Models\Categoria;
use App\Models\Producto;
use App\Models\Usuario;
use Illuminate\Database\Seeder;

class ProductoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = Usuario::where('rol', 'administrador')->first() ?? Usuario::first();
        $gerente = Usuario::where('rol', 'gerente')->first() ?? $admin;

        // Categorías
        $catPantallas = Categoria::where('nombre', 'Displays y Pantallas')->first();
        $catBaterias = Categoria::where('nombre', 'Baterías de Alta Capacidad')->first();
        $catFlex = Categoria::where('nombre', 'Centros de Carga y Flexores')->first();
        $catEstaciones = Categoria::where('nombre', 'Estaciones y Soldadura')->first();
        $catMicroscopios = Categoria::where('nombre', 'Microscopios y Diagnóstico')->first();
        $catConsumibles = Categoria::where('nombre', 'Consumibles y Químicos')->first();
        $catHerramientas = Categoria::where('nombre', 'Herramientas de Precisión')->first();

        $catalogo = [
            // Displays y Pantallas
            [
                'data' => [
                    'nombre' => 'Pantalla OLED Calidad Original iPhone 13 Pro',
                    'descripcion' => 'Módulo display Super Retina XDR 120Hz ProMotion con soporte TrueTone, táctil capacitivo multitouch.',
                    'precio' => 2850.00,
                    'existencia' => 12,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catPantallas?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Pantalla Dynamic AMOLED 2X Samsung Galaxy S23 Ultra',
                    'descripcion' => 'Display con marco original Service Pack, resolución QHD+, lector ultrasónico compatible.',
                    'precio' => 4600.00,
                    'existencia' => 6,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catPantallas?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Pantalla LCD Incell Xiaomi Redmi Note 12 4G / 5G',
                    'descripcion' => 'Refacción calidad Incell de alta tasa de refresco, brillo nítido y ajuste exacto al chasis.',
                    'precio' => 580.00,
                    'existencia' => 25,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catPantallas?->id]),
            ],

            // Baterías
            [
                'data' => [
                    'nombre' => 'Batería de Reemplazo Premium iPhone 12 / 12 Pro 2815mAh',
                    'descripcion' => 'Celda de polímero de litio con chip de control TI, 0 ciclos de carga, protección de sobrevoltaje.',
                    'precio' => 450.00,
                    'existencia' => 30,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catBaterias?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Batería Original Service Pack Samsung A54 5G (EB-BA546ABY)',
                    'descripcion' => 'Capacidad nominal 5000mAh, incluye cinta adhesiva térmica de montaje para chasis.',
                    'precio' => 520.00,
                    'existencia' => 18,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catBaterias?->id]),
            ],

            // Flexores y Carga
            [
                'data' => [
                    'nombre' => 'Sub-Placa Centro de Carga USB-C Moto G60 con Micrófono',
                    'descripcion' => 'Módulo flex conector tipo C compatible con carga rápida TurboPower 30W y componentes IC integrados.',
                    'precio' => 220.00,
                    'existencia' => 20,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catFlex?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Flex de Interconexión Main a Sub-Board Xiaomi Poco X3 Pro',
                    'descripcion' => 'Flex FPC de transmisión de datos y alimentación de carga rápida 33W.',
                    'precio' => 180.00,
                    'existencia' => 15,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catFlex?->id]),
            ],

            // Herramientas de Soldadura y Taller
            [
                'data' => [
                    'nombre' => 'Estación de Calor 2 en 1 Sugon 8620DX Pro 1000W',
                    'descripcion' => 'Estación profesional con control digital de temperatura, flujo de aire ciclónico y apagado magnético.',
                    'precio' => 3750.00,
                    'existencia' => 5,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catEstaciones?->id, $catHerramientas?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Plancha Separadora de Pantallas LCD Mechanic 968 con Bomba de Vacío',
                    'descripcion' => 'Placa de aluminio con control PID de calentamiento constante hasta 120°C y succión integrada.',
                    'precio' => 1450.00,
                    'existencia' => 8,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catEstaciones?->id, $catPantallas?->id]),
            ],

            // Microscopios
            [
                'data' => [
                    'nombre' => 'Microscopio Trinocular Estereoscópico Relife RL-M3T con Luz LED',
                    'descripcion' => 'Zoom continuo de 7X a 45X, distancia de trabajo amplia para microelectrónica y reparación de placas.',
                    'precio' => 5900.00,
                    'existencia' => 4,
                    'usuario_id' => $admin->id,
                ],
                'categorias' => array_filter([$catMicroscopios?->id, $catHerramientas?->id]),
            ],

            // Consumibles
            [
                'data' => [
                    'nombre' => 'Pegamento Negro T7000 Profesional 110ml para Pantallas',
                    'descripcion' => 'Adhesivo epóxico de alta elasticidad color negro, sellado impermeable ideal para pantallas oscuras.',
                    'precio' => 135.00,
                    'existencia' => 45,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catConsumibles?->id, $catPantallas?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Estaño en Pasta Mechanic 183°C Sn63/Pb37 35g',
                    'descripcion' => 'Soldadura en pasta especial para reballing de circuitos integrados BGA y conectores FPC.',
                    'precio' => 190.00,
                    'existencia' => 40,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catConsumibles?->id, $catEstaciones?->id]),
            ],

            // Herramientas Manuales
            [
                'data' => [
                    'nombre' => 'Kit de Destornilladores de Precisión 2D Mechanic King Pro',
                    'descripcion' => 'Aleación de magnesio y silicio, cabeza con rodamiento silencioso y puntas magnetizadas antideslizantes.',
                    'precio' => 650.00,
                    'existencia' => 22,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catHerramientas?->id]),
            ],
            [
                'data' => [
                    'nombre' => 'Juego de Pinzas de Titanio Ultradelgadas Relife RT-11C / 15C',
                    'descripcion' => 'Pinzas no magnéticas de 0.15mm de punta para colocación de puentes (jumper) y microcomponentes 0201.',
                    'precio' => 340.00,
                    'existencia' => 18,
                    'usuario_id' => $gerente->id,
                ],
                'categorias' => array_filter([$catHerramientas?->id]),
            ],
        ];

        foreach ($catalogo as $item) {
            $prod = Producto::firstOrCreate(
                ['nombre' => $item['data']['nombre']],
                $item['data']
            );

            if (!empty($item['categorias'])) {
                $prod->categorias()->syncWithoutDetaching($item['categorias']);
            }
        }
    }
}
