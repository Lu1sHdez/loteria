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

    wp_enqueue_style(

        'juguemos-wizard',

        JUGUEMOS_URL . 'public/css/wizard.css',

        [],

        JUGUEMOS_VERSION

    );

}


}