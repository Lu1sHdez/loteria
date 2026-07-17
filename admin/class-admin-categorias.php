<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Admin_Categorias
{
    public static function get_all()
    {
        global $wpdb;

        return $wpdb->get_results(
            "SELECT *
            FROM {$wpdb->prefix}juguemos_categorias
            WHERE activo = 1
            ORDER BY orden ASC"
        );
    }
    public static function create($nombre)
    {
        global $wpdb;

        $orden = (int) $wpdb->get_var(
            "SELECT IFNULL(MAX(orden),0)+1
            FROM {$wpdb->prefix}juguemos_categorias"
        );

        $wpdb->insert(

            $wpdb->prefix . 'juguemos_categorias',

            [

                'nombre' => sanitize_text_field($nombre),
                'slug'   => sanitize_title($nombre),
                'activo' => 1,
                'orden'  => $orden

            ]

        );

        return [

            'id' => $wpdb->insert_id,
            'nombre' => sanitize_text_field($nombre)

        ];
    }
    public static function delete($id)
    {
        global $wpdb;
        return $wpdb->delete(
            $wpdb->prefix . 'juguemos_categorias',
            [
                'id' => $id
            ],
            [
                '%d'
            ]

        );
    }
}
