<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Admin_Barajas
{

    public static function get_by_design($design_id)
    {
        global $wpdb;

        return $wpdb->get_results(

            $wpdb->prepare(

                "SELECT *
                FROM {$wpdb->prefix}juguemos_barajas
                WHERE design_id = %d
                AND activo = 1
                ORDER BY numero ASC",

                $design_id

            )

        );
    }

    public static function get($id)
    {
        global $wpdb;

        return $wpdb->get_row(

            $wpdb->prepare(

                "SELECT *
                FROM {$wpdb->prefix}juguemos_barajas
                WHERE id = %d",

                $id

            )

        );
    }

    public static function create($data)
    {
        global $wpdb;

        $slug = sanitize_title($data['nombre']);

        $wpdb->insert(

            $wpdb->prefix . 'juguemos_barajas',

            [

                'design_id' => intval($data['design_id']),

                'numero'    => intval($data['numero']),

                'nombre'    => sanitize_text_field($data['nombre']),

                'slug'      => $slug,

                'imagen'    => sanitize_text_field($data['imagen']),

                'orden'     => intval($data['numero']),

                'activo'    => 1

            ]

        );

        return $wpdb->insert_id;
    }

    public static function update($id, $data)
    {
        global $wpdb;

        return $wpdb->update(

            $wpdb->prefix . 'juguemos_barajas',

            [
                'nombre' => sanitize_text_field($data['nombre']),
                'slug'   => sanitize_title($data['nombre']),
                'imagen' => sanitize_text_field($data['imagen'])
            ],

            [

                'id' => intval($id)

            ]

        );
    }

    public static function delete($id)
    {
        global $wpdb;

        return $wpdb->update(

            $wpdb->prefix . 'juguemos_barajas',

            [

                'activo' => 0

            ],

            [   

                'id' => intval($id)

            ]

        );
    }

}