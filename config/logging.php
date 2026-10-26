<?php

use Monolog\Handler\NullHandler;
use Monolog\Handler\StreamHandler;
use Monolog\Handler\SyslogUdpHandler;
use Monolog\Processor\PsrLogMessageProcessor;

return [

    'default' => env('LOG_CHANNEL', 'stack'),

    'deprecations' => [
        'channel' => env('LOG_DEPRECATIONS_CHANNEL', 'null'),
        'trace' => env('LOG_DEPRECATIONS_TRACE', false),
    ],

    'channels' => [

        'stack' => [
            'driver' => 'stack',
            'channels' => ['single'],
            'ignore_exceptions' => false,
        ],

        'single' => [
            'driver' => 'single',
            'path' => storage_path('logs/laravel.log'),
            'level' => env('LOG_LEVEL', 'debug'),
            'replace_placeholders' => true,
        ],

        /*
        |----------------------------------------------------------------------
        | Canales Obligatorios de Bitácora (AAA: Audit, Auth, Activity)
        |----------------------------------------------------------------------
        */
        'autenticacion' => [
            'driver' => 'single',
            'path' => storage_path('logs/autenticacion.log'),
            'level' => 'info',
            'replace_placeholders' => true,
        ],

        'productos' => [
            'driver' => 'single',
            'path' => storage_path('logs/productos.log'),
            'level' => 'info',
            'replace_placeholders' => true,
        ],

        'ventas' => [
            'driver' => 'single',
            'path' => storage_path('logs/ventas.log'),
            'level' => 'info',
            'replace_placeholders' => true,
        ],

    ],

];
