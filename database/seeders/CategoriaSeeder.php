<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            [
                'nombre' => 'Displays y Pantallas',
                'descripcion' => 'Módulos completos OLED, AMOLED e Incell para Apple, Samsung, Xiaomi y Motorola.',
            ],
            [
                'nombre' => 'Baterías de Alta Capacidad',
                'descripcion' => 'Baterías internas con chip original, 0 ciclos de carga y protección térmica.',
            ],
            [
                'nombre' => 'Centros de Carga y Flexores',
                'descripcion' => 'Módulos sub-placa flex con conector USB-C / Lightning, micrófono y carga rápida.',
            ],
            [
                'nombre' => 'Estaciones y Soldadura',
                'descripcion' => 'Pistolas de aire caliente, cautines de precisión T12/JBC, fuentes de poder y planchas LCD.',
            ],
            [
                'nombre' => 'Microscopios y Diagnóstico',
                'descripcion' => 'Microscopios trinoculares estereoscópicos, cámaras HDMI y multímetros de precisión.',
            ],
            [
                'nombre' => 'Consumibles y Químicos',
                'descripcion' => 'Pegamentos B7000/T7000, estaño en pasta 183°C, flux UV559, alcohol isopropílico y cinta Kapton.',
            ],
            [
                'nombre' => 'Herramientas de Precisión',
                'descripcion' => 'Kits de destornilladores pentalobe/tri-point, pinzas curvas ESD, espátulas iSesamo y tapetes térmicos.',
            ],
        ];

        foreach ($categorias as $cat) {
            Categoria::firstOrCreate(['nombre' => $cat['nombre']], $cat);
        }
    }
}
