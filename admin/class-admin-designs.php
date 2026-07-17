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
                ORDER BY nombre ASC
                ",
                $categoria_id
            )
        );
    }
    public static function create($data)
    {
        global $wpdb;

        $slug = sanitize_title($data['nombre']);

        $wpdb->insert(

            $wpdb->prefix . 'juguemos_designs',

            [

                'categoria_id' => intval($data['categoria_id']),
                'nombre'       => sanitize_text_field($data['nombre']),
                'slug'         => $slug,
                'activo'       => 1,
                'orden'        => 0

            ]

        );

        if (!$wpdb->insert_id) {
            return false;
        }

        $design_id = $wpdb->insert_id;

        // Crear la estructura de carpetas
        Juguemos_Files::create_design_directory($design_id);

        return $design_id;
    }

    public static function get($id)
    {
        global $wpdb;

        return $wpdb->get_row(

            $wpdb->prepare(

                "SELECT *
                FROM {$wpdb->prefix}juguemos_designs
                WHERE id=%d",

                $id

            )

        );
    }
    public static function update($id, $data)
    {
        global $wpdb;

        return $wpdb->update(

            $wpdb->prefix.'juguemos_designs',

            [

                'nombre' => sanitize_text_field($data['nombre']),
                'slug' => sanitize_title($data['nombre']),
                'categoria_id' => intval($data['categoria_id'])

            ],

            [

                'id' => intval($id)

            ]

        );
    }
    public static function delete($id)
    {
        global $wpdb;

        return $wpdb->delete(

            $wpdb->prefix . 'juguemos_designs',

            [

                'id' => intval($id)

            ],

            [

                '%d'

            ]

        );
    }





    public static function get_portada($design)
    {
        if (!empty($design->portada)) {

            return esc_url($design->portada);

        }

        $barajas = Juguemos_Admin_Barajas::get_by_design($design->id);

        if (!empty($barajas)) {

            return esc_url(
                Juguemos_Files::preview_url($design->id) . $barajas[0]->imagen
            );

        }

        return esc_url(JUGUEMOS_URL . 'assets/img/default-portada.png');
    }
}



