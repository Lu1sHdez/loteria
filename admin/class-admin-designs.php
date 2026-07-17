<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Admin_Designs
{
    public static function get_by_category($categoria_id)
    {
        global $wpdb;

        return $wpdb->get_results(
            $wpdb->prepare(
                "
                SELECT *
                FROM {$wpdb->prefix}juguemos_designs
                WHERE categoria_id = %d
                AND activo = 1
                ORDER BY orden ASC, nombre ASC
                ",
                $categoria_id
            )
        );
    }
    public static function create($data)
    {
        global $wpdb;

        $slug = sanitize_title(
            $data['nombre']
        );

        return $wpdb->insert(

            $wpdb->prefix.'juguemos_designs',

            [

                'categoria_id' => intval($data['categoria_id']),

                'nombre' => sanitize_text_field($data['nombre']),

                'slug' => $slug,

                'activo' => 1,

                'orden' => 0

            ]

        );

    }
}



