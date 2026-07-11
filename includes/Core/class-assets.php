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