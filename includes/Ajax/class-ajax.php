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

        // Diseños (antes "barajas" por categoría)
        add_action(
            'wp_ajax_juguemos_decks',
            [$this, 'decks']
        );

        add_action(
            'wp_ajax_nopriv_juguemos_decks',
            [$this, 'decks']
        );

        // Barajas (las 54 cartas de un diseño)
        add_action(
            'wp_ajax_juguemos_barajas',
            [$this, 'barajas']
        );

        add_action(
            'wp_ajax_nopriv_juguemos_barajas',
            [$this, 'barajas']
        );

        add_action(
            'wp_ajax_juguemos_price',
            [$this,'price']
        );

        add_action(
            'wp_ajax_nopriv_juguemos_price',
            [$this,'price']
        );
        add_action(
            'wp_ajax_juguemos_get_design',
            [$this, 'get_design']
        );
    
        add_action(
            'wp_ajax_nopriv_juguemos_get_design',
            [$this, 'get_design']
        );

    }

    public function categories()
    {

        $categorias = Juguemos_Admin_Categorias::get_all();

        $data = array_map(function ($categoria) {

            return [

                'id'     => $categoria->id,

                'nombre' => $categoria->nombre

            ];

        }, $categorias);

        wp_send_json_success($data);

    }

    public function decks()
    {

        $categoria_id = intval(
            $_GET['categoria_id'] ?? 0
        );

        if (!$categoria_id) {

            wp_send_json_error(
                'Categoría inválida.'
            );

            return;

        }

        $designs = Juguemos_Admin_Designs::get_by_category($categoria_id);

        $data = array_map(function ($design) {

            return [

                'id'      => $design->id,

                'nombre'  => $design->nombre,

                'portada' => Juguemos_Admin_Designs::get_portada($design)

            ];

        }, $designs);

        wp_send_json_success($data);

    }

    public function barajas()
    {

        $design_id = intval(
            $_GET['design_id'] ?? 0
        );

        if (!$design_id) {

            wp_send_json_error(
                'Diseño inválido.'
            );

            return;

        }

        $barajas = Juguemos_Admin_Barajas::get_by_design($design_id);

        $preview_url = Juguemos_Files::preview_url($design_id);

        $data = array_map(function ($baraja) use ($preview_url) {

            return [

                'id'     => $baraja->id,

                'numero' => $baraja->numero,

                'nombre' => $baraja->nombre,

                'imagen' => esc_url($preview_url . $baraja->imagen)

            ];

        }, $barajas);

        wp_send_json_success($data);

    }


    public function price()
    {

        $pais = sanitize_text_field(
            $_GET['pais'] ?? 'Mexico'
        );

        $modo = sanitize_text_field(
            $_GET['modo'] ?? 'sencilla'
        );

        $cantidad = intval(
            $_GET['cantidad'] ?? 1
        );

        $price = Juguemos_Pricing::calculate(
            $pais,
            $modo,
            $cantidad
        );

        wp_send_json_success($price);

    }

    public function get_design()
    {
        $design_id = intval($_GET['design_id'] ?? 0);

        if (!$design_id) {
            wp_send_json_error('Diseño inválido.');
            return;
        }

        $design = Juguemos_Admin_Designs::get($design_id);

        if (!$design) {
            wp_send_json_error('Diseño no encontrado.');
            return;
        }

        wp_send_json_success([
            'id'       => $design->id,
            'nombre'   => $design->nombre,
            'portada'  => Juguemos_Admin_Designs::get_portada($design)
        ]);
    }

}