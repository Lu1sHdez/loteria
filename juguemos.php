<?php
/**
 * Plugin Name: Juguemos
 * Plugin URI: https://loterialadama.com
 * Description: Generador de tablas personalizadas para Lotería La Dama.
 * Version: 1.0.0
 * Author: Luis Hdez
 * Text Domain: juguemos
 */

if (!defined('ABSPATH')) {
    exit;
}


/**
 * Constantes principales
 */
define('JUGUEMOS_VERSION', '1.0.0');
define('JUGUEMOS_PATH', plugin_dir_path(__FILE__));
define('JUGUEMOS_URL', plugin_dir_url(__FILE__));


/**
 * Cargar archivos principales
 */
require_once JUGUEMOS_PATH . 'includes/class-loader.php';
require_once JUGUEMOS_PATH . 'includes/class-install.php';


/**
 * Activación del plugin
 * Aquí se crean tablas iniciales
 */
register_activation_hook(
    __FILE__,
    array(
        'Juguemos_Install',
        'activate'
    )
);


/**
 * Iniciar plugin
 */
new Juguemos_Loader();