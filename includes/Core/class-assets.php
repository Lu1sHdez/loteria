<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Assets
{

    public function __construct()
    {

        add_action(
            'wp_enqueue_scripts',
            [$this, 'frontend_assets']
        );

    }

    public function frontend_assets()
    {

        // CSS
        wp_enqueue_style(
            'juguemos-wizard',
            JUGUEMOS_URL . 'public/css/wizard.css',
            [],
            JUGUEMOS_VERSION
        );
        // CSS
        wp_enqueue_style(
            'juguemos-css-reutilizar',
            JUGUEMOS_URL . 'public/css/reutilizar.css',
            [],
            JUGUEMOS_VERSION
        );
        wp_enqueue_style(
            'juguemos-login',
            JUGUEMOS_URL . 'public/css/admin/login.css',
            [],
            JUGUEMOS_VERSION
        );
        wp_enqueue_style(
            'juguemos-admin-agregar',
            JUGUEMOS_URL . 'public/css/admin/dashboard.css',
            [],
            JUGUEMOS_VERSION
        );
        wp_enqueue_style(
            'juguemos-fuente',
            JUGUEMOS_URL . 'public/css/fuente.css',
            [],
            JUGUEMOS_VERSION
        );
        //botones globales
        wp_enqueue_style(
            'juguemos-botones',
            JUGUEMOS_URL . 'public/css/botones.css',
            [],
            JUGUEMOS_VERSION
        );
        wp_enqueue_style(
            'juguemos-diseno-admin-barajas',
            JUGUEMOS_URL . 'public/css/admin/diseno-barajas.css',
            [],
            JUGUEMOS_VERSION
        );


        wp_enqueue_style(
            'juguemos-admin-manage-category',
            JUGUEMOS_URL . 'public/css/admin/manage-categories.css',
            [],
            JUGUEMOS_VERSION
        );

        wp_enqueue_style(
            'juguemos-admin',
            JUGUEMOS_URL . 'public/css/admin/agregar.css',
            [],
            JUGUEMOS_VERSION
        );

        // AJAX
        wp_enqueue_script(
            'juguemos-ajax',
            JUGUEMOS_URL . 'public/js/ajax.js',
            [],
            JUGUEMOS_VERSION,
            true
        );
        
        wp_enqueue_script(
            'juguemos-state',
            JUGUEMOS_URL.'public/js/state.js',
            [],
            JUGUEMOS_VERSION,
            true
        );
        wp_enqueue_script(
            'juguemos-pago',
            JUGUEMOS_URL . 'public/js/pago.js',
            ['jquery'],
            JUGUEMOS_VERSION,
            true
        );

        wp_enqueue_script(
            'juguemos-print-preview',
            JUGUEMOS_URL . 'public/js/print-preview.js',
            [
                'juguemos-state'
            ],
            JUGUEMOS_VERSION,
            true
        );
        
        wp_enqueue_script(
            'juguemos-app',
            JUGUEMOS_URL.'public/js/app.js',
            [
                'juguemos-ajax',
                'juguemos-state',
                'juguemos-print-preview'
            ],
            JUGUEMOS_VERSION,
            true
        );
        wp_enqueue_script(
            'juguemos-grid-posiciones',
            JUGUEMOS_URL . 'public/js/ubicaciones/grid-posiciones.js',
            [],
            JUGUEMOS_VERSION,
            true
        );

        wp_enqueue_script(
            'juguemos-favoritas-logic',
            JUGUEMOS_URL . 'public/js/favoritas-logic.js',
            [],
            JUGUEMOS_VERSION,
            true
        );
        
        // Variables para JavaScript
        wp_localize_script(
            'juguemos-app',
            'Juguemos',
            [
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce'    => wp_create_nonce('juguemos_nonce'),
            ]
        );
        // =========================================================
        // POCITOS 3 - CONECTOR DE MITADES
        // =========================================================

        wp_enqueue_style(
            'juguemos-pocitos3-preview',
            JUGUEMOS_URL . 'public/css/pocitos3-preview.css',
            [],
            JUGUEMOS_VERSION
        );
        wp_enqueue_script(
            'juguemos-libre-upload',
            JUGUEMOS_URL . 'public/js/libre-upload.js',
            ['juguemos-state'],
            JUGUEMOS_VERSION,
            true
        );
        wp_enqueue_script(
            'juguemos-favoritas-distribucion',
            JUGUEMOS_URL . 'public/js/favoritas-distribucion.js',
            ['juguemos-state', 'juguemos-ajax'],
            JUGUEMOS_VERSION,
            true
        );

        wp_enqueue_script(
            'juguemos-design-preview-modal',
            JUGUEMOS_URL . 'public/js/design-preview-modal.js',
            ['juguemos-state', 'juguemos-ajax'],
            JUGUEMOS_VERSION,
            true
        );
    
        wp_enqueue_script(
            'juguemos-favoritas',
            JUGUEMOS_URL . 'public/js/favoritas.js',
            ['juguemos-state', 'juguemos-ajax',  'juguemos-favoritas-logic'],
            JUGUEMOS_VERSION,
            true
        );

        // En la función frontend_assets(), después de cargar favoritas.js
        wp_enqueue_script(
            'juguemos-dobles',
            JUGUEMOS_URL . 'public/js/dobles.js',
            ['juguemos-grid-posiciones','juguemos-state', 'juguemos-ajax'],
            JUGUEMOS_VERSION,
            true
        );
        // En public/js/class-assets.php
        wp_enqueue_script(
            'juguemos-libre-preview',
            JUGUEMOS_URL . 'public/js/libre-preview.js',
            ['juguemos-state'],
            JUGUEMOS_VERSION,
            true
        );

        // =========================================================    
        // GENERADOR DE PDF (paso 4 - Pago y Descarga)
        // =========================================================

        wp_enqueue_script(
            'html2canvas',
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            [],
            '1.4.1',
            true
        );

        wp_enqueue_script(
            'jspdf',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            [],
            '2.5.1',
            true
        );

        wp_enqueue_script(
            'juguemos-pdf-generator',
            JUGUEMOS_URL . 'public/js/pdf-generator.js',
            [
                'juguemos-state',
                'juguemos-print-preview',
                'juguemos-app',
                'html2canvas',
                'jspdf'
            ],
            JUGUEMOS_VERSION,
            true
        );

    }

}
