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
        
        $design_id = intval($data['design_id']);
        $numero = intval($data['numero']);
        $nombre = sanitize_text_field($data['nombre']);
        $slug = sanitize_title($nombre);
        $imagen = sanitize_text_field($data['imagen']);
        
        // 🔥 PRIMERO: Verificar si ya existe una baraja inactiva con este número
        $existe_inactiva = $wpdb->get_var($wpdb->prepare(
            "SELECT id FROM {$wpdb->prefix}juguemos_barajas 
            WHERE design_id = %d AND numero = %d AND activo = 0",
            $design_id, $numero
        ));
        
        if ($existe_inactiva) {
            // 🔥 REACTIVAR: Actualizar la baraja existente con los nuevos datos
            $wpdb->update(
                $wpdb->prefix . 'juguemos_barajas',
                [
                    'nombre' => $nombre,
                    'slug' => $slug,
                    'imagen' => $imagen,
                    'activo' => 1,
                    'orden' => $numero
                ],
                ['id' => $existe_inactiva],
                ['%s', '%s', '%s', '%d', '%d'],
                ['%d']
            );
            return $existe_inactiva;
        }
        
        // 🔥 SEGUNDO: Si no existe inactiva, crear nueva
        $wpdb->insert(
            $wpdb->prefix . 'juguemos_barajas',
            [
                'design_id' => $design_id,
                'numero'    => $numero,
                'nombre'    => $nombre,
                'slug'      => $slug,
                'imagen'    => $imagen,
                'orden'     => $numero,
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

        return $wpdb->delete(
            $wpdb->prefix . 'juguemos_barajas',
            ['id' => intval($id)],
            ['%d']
        );
    }
    /**
     * Obtener el siguiente número disponible para un diseño
     * Considera TODAS las barajas (activas e inactivas)
     */
    public static function get_next_number($design_id)
    {
        global $wpdb;
        
        $max_numero = $wpdb->get_var($wpdb->prepare(
            "SELECT IFNULL(MAX(numero), 0) 
            FROM {$wpdb->prefix}juguemos_barajas 
            WHERE design_id = %d",
            $design_id
        ));
        
        return intval($max_numero) + 1;
    }

    /**
     * Obtener todas las barajas incluyendo inactivas (para debugging)
     */
    public static function get_all_by_design($design_id)
    {
        global $wpdb;

        return $wpdb->get_results(
            $wpdb->prepare(
                "SELECT *
                FROM {$wpdb->prefix}juguemos_barajas
                WHERE design_id = %d
                ORDER BY numero ASC",
                $design_id
            )
        );
    }

}