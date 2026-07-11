<?php

if (!defined('ABSPATH')) {
    exit;
}


class Juguemos_Admin
{


    public function __construct()
    {

        add_action(
            'admin_menu',
            [$this,'menu']
        );

    }



    public function menu()
    {


        add_menu_page(

            'Juguemos',

            'Juguemos',

            'manage_options',

            'juguemos',

            [$this,'dashboard'],

            'dashicons-grid-view',

            25

        );


        add_submenu_page(
            'juguemos',
            'Barajas',
            'Barajas',
            'manage_options',
            'juguemos-decks',
            [$this,'decks']
        );


        add_submenu_page(
            'juguemos',
            'Cartas',
            'Cartas',
            'manage_options',
            'juguemos-cards',
            [$this,'cards']
        );


        add_submenu_page(
            'juguemos',
            'Precios',
            'Precios',
            'manage_options',
            'juguemos-prices',
            [$this,'dashboard']
        );



    }



    public function dashboard()
    {

        echo "<h1>Juguemos</h1>";
        echo "<p>Administrador del generador de lotería</p>";

    }

    public function decks()
    {

        include JUGUEMOS_PATH . 
        'admin/views/decks.php';

    }
    public function cards()
    {
        include JUGUEMOS_PATH .
        'admin/views/cards.php';
    }

    
}