<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Price_Repository
{

    /**
     * Obtener precio unitario
     */
    public static function get_price($pais, $modo)
    {

        global $wpdb;

        return $wpdb->get_var(

            $wpdb->prepare(

                "SELECT precio

                FROM {$wpdb->prefix}juguemos_prices

                WHERE pais=%s

                AND modo=%s

                LIMIT 1",

                $pais,
                $modo

            )

        );

    }


    /**
     * Obtener toda la información del precio
     */
    public static function get($pais, $modo)
    {

        global $wpdb;

        return $wpdb->get_row(

            $wpdb->prepare(

                "SELECT *

                FROM {$wpdb->prefix}juguemos_prices

                WHERE pais=%s

                AND modo=%s

                LIMIT 1",

                $pais,
                $modo

            )

        );

    }

}