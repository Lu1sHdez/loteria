<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Categoria_Repository
{
    public static function get_all()
    {
        global $wpdb;

        return $wpdb->get_results(
            "SELECT *
            FROM {$wpdb->prefix}juguemos_categorias
            WHERE activo = 1
            ORDER BY nombre ASC"
        );
    }
}