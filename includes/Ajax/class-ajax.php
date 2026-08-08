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
        add_action('wp_ajax_juguemos_verify_payment', [$this, 'verify_payment']);
        add_action('wp_ajax_nopriv_juguemos_verify_payment', [$this, 'verify_payment']);

        add_action('wp_ajax_juguemos_verify_stripe', [$this, 'verify_stripe_payment']);
        add_action('wp_ajax_nopriv_juguemos_verify_stripe', [$this, 'verify_stripe_payment']);
        
        add_action('wp_ajax_juguemos_mark_paid', [$this, 'mark_paid']);
        add_action('wp_ajax_nopriv_juguemos_mark_paid', [$this, 'mark_paid']);
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




    public function verify_payment()
    {
        check_ajax_referer('juguemos_nonce', 'nonce');

        $token = sanitize_text_field($_POST['token'] ?? '');

        if (!$token) {
            wp_send_json_success(['paid' => false]);
            return;
        }

        // Revisa si ya quedó marcado como pagado por el return-handler
        $paid = get_transient('juguemos_paid_' . $token);

        if ($paid) {
            wp_send_json_success(['paid' => true]);
            return;
        }

        // Si no está marcado, intenta capturarlo directamente (por si el popup nunca volvió)
        $handler = new Juguemos_PayPal_Handler();
        $result = $handler->capture_order($token);

        if ($result) {
            set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);
            wp_send_json_success(['paid' => true]);
            return;
        }

        wp_send_json_success(['paid' => false]);
    }

    /**
     * Verifica el pago con Stripe
     */
    public function verify_stripe_payment() {
        check_ajax_referer('juguemos_nonce', 'nonce');
        
        $session_id = sanitize_text_field($_POST['session_id'] ?? '');
        $order_id = sanitize_text_field($_POST['order_id'] ?? '');
        
        if (!$session_id || !$order_id) {
            wp_send_json_error(['message' => 'Datos incompletos']);
            return;
        }
        
        $handler = new Juguemos_Stripe_Handler();
        
        // Verificar si ya está marcado como pagado
        $paid = get_transient('juguemos_paid_' . $order_id);
        if ($paid) {
            wp_send_json_success(['paid' => true]);
            return;
        }
        
        // Verificar con Stripe
        if ($handler->is_payment_completed($session_id)) {
            set_transient('juguemos_paid_' . $order_id, true, HOUR_IN_SECONDS);
            wp_send_json_success(['paid' => true]);
            return;
        }
        
        wp_send_json_success(['paid' => false]);
    }
    /**
     * Marca un pago como completado manualmente (para Zelle)
     */
    public function mark_paid() {
        check_ajax_referer('juguemos_nonce', 'nonce');
        
        $token = sanitize_text_field($_POST['token'] ?? '');
        if (!$token) {
            wp_send_json_error('Token inválido');
            return;
        }
        
        set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);
        wp_send_json_success(['paid' => true]);
    }

}
