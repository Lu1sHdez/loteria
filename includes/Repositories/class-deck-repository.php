<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Deck_Repository
{

    public static function get_by_category($category)
    {

        global $wpdb;

        $decks=$wpdb->get_results(

            $wpdb->prepare(

                "SELECT *

                FROM {$wpdb->prefix}juguemos_decks

                WHERE categoria=%s

                AND activo=1

                ORDER BY nombre",

                $category

            )

        );

        foreach($decks as &$deck){

            $deck->portada=wp_get_attachment_image_url(

                $deck->portada_id,

                'large'

            );

        }

        return $decks;

    }

}