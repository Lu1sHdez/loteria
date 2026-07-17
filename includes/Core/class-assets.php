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
            'juguemos-app',
            JUGUEMOS_URL.'public/js/app.js',
            [
                'juguemos-ajax',
                'juguemos-state'
            ],
            JUGUEMOS_VERSION,
            true
        );

        // APP
        wp_enqueue_script(
            'juguemos-app',
            JUGUEMOS_URL . 'public/js/app.js',
            ['juguemos-ajax'],
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

    }

}