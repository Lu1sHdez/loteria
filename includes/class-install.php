<?php

if (!defined('ABSPATH')) {
    exit;
}

require_once JUGUEMOS_PATH .
'includes/Database/class-seeder.php';

class Juguemos_Install
{

    public static function activate()
    {

        global $wpdb;

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $charset = $wpdb->get_charset_collate();



        /*
        |--------------------------------------------------------------------------
        | CATEGORÍAS
        |--------------------------------------------------------------------------
        */

        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_categories (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,

            nombre VARCHAR(150) NOT NULL,

            tipo VARCHAR(50),

            orden INT DEFAULT 0,

            activo TINYINT(1) DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

            PRIMARY KEY(id)

        ) $charset;");





        /*
        |--------------------------------------------------------------------------
        | CARTAS BASE (54 oficiales)
        |--------------------------------------------------------------------------
        */

        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_cards (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,

            nombre VARCHAR(150) NOT NULL,

            categoria_id BIGINT(20),

            popular TINYINT(1) DEFAULT 0,

            activo TINYINT(1) DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)

        ) $charset;");






        /*
        |--------------------------------------------------------------------------
        | BARAJAS / ESTILOS
        |--------------------------------------------------------------------------
        |
        | Ejemplo:
        |
        | Kawaii
        | Elegante
        | Animada
        |
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_decks (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,

            nombre VARCHAR(150),

            categoria VARCHAR(100),

            portada TEXT,

            descripcion TEXT,

            activo TINYINT(1) DEFAULT 1,

            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)


        ) $charset;");








        /*
        |--------------------------------------------------------------------------
        | RELACIÓN BARAJA - CARTAS
        |--------------------------------------------------------------------------
        |
        | Aquí vive cada versión de cada carta
        |
        | La Dama Kawaii
        | La Dama Elegante
        |
        |--------------------------------------------------------------------------
        */



        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_deck_cards (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            deck_id BIGINT(20),

            card_id BIGINT(20),


            imagen TEXT,


            PRIMARY KEY(id)


        ) $charset;");







        /*
        |--------------------------------------------------------------------------
        | PATRONES
        |--------------------------------------------------------------------------
        |
        | Dobles
        | Favoritas
        |
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_patterns (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            nombre VARCHAR(100),


            tipo VARCHAR(50),


            coordenadas LONGTEXT,


            activo TINYINT(1) DEFAULT 1,


            PRIMARY KEY(id)


        ) $charset;");









        /*
        |--------------------------------------------------------------------------
        | PRECIOS
        |--------------------------------------------------------------------------
        |
        | México
        | USA
        |
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_prices (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            pais VARCHAR(50),


            moneda VARCHAR(10),


            modo VARCHAR(50),


            precio DECIMAL(10,2),


            PRIMARY KEY(id)


        ) $charset;");









        /*
        |--------------------------------------------------------------------------
        | CARTAS PERSONALIZADAS (MODO LIBRE)
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_custom_cards (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            session_id VARCHAR(200),


            nombre VARCHAR(150),


            imagen TEXT,


            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)


        ) $charset;");









        /*
        |--------------------------------------------------------------------------
        | GENERACIONES
        |--------------------------------------------------------------------------
        |
        | Resultado del algoritmo
        |
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_generations (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            session_id VARCHAR(200),


            tipo VARCHAR(50),


            configuracion LONGTEXT,


            resultado LONGTEXT,


            order_id BIGINT(20),


            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)


        ) $charset;");









        /*
        |--------------------------------------------------------------------------
        | PDF GENERADOS
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_files (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            generation_id BIGINT(20),


            archivo TEXT,


            descargado INT DEFAULT 0,


            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)


        ) $charset;");









        /*
        |--------------------------------------------------------------------------
        | CONFIGURACIÓN GLOBAL
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_settings (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            nombre VARCHAR(150),


            valor LONGTEXT,


            PRIMARY KEY(id)


        ) $charset;");








        /*
        |--------------------------------------------------------------------------
        | LOGS
        |--------------------------------------------------------------------------
        */


        dbDelta("CREATE TABLE {$wpdb->prefix}juguemos_logs (

            id BIGINT(20) NOT NULL AUTO_INCREMENT,


            tipo VARCHAR(50),


            mensaje TEXT,


            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,


            PRIMARY KEY(id)


        ) $charset;");

        Juguemos_Seeder::run();

    }
   

}