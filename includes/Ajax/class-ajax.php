<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Ajax
{

    public function __construct()
    {

        // Categorías
        add_action(
            'wp_ajax_juguemos_categories',
            [$this, 'categories']
        );

        add_action(
            'wp_ajax_nopriv_juguemos_categories',
            [$this, 'categories']
        );

        // Barajas
        add_action(
            'wp_ajax_juguemos_decks',
            [$this, 'decks']
        );

        add_action(
            'wp_ajax_nopriv_juguemos_decks',
            [$this, 'decks']
        );

    }

    public function categories()
    {

        $categories = Juguemos_Category_Repository::get_all();

        wp_send_json_success($categories);

    }

    public function decks()
    {

        $category = sanitize_text_field(
            $_GET['category'] ?? ''
        );

        $decks = Juguemos_Deck_Repository::get_by_category(
            $category
        );

        wp_send_json_success($decks);

    }

}