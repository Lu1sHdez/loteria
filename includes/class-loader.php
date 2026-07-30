<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Loader
{

    public function __construct()
    {
        $this->load_dependencies();
        $this->init_plugin();
    }


    private function load_dependencies()
    {

        require_once JUGUEMOS_PATH . 'includes/Core/class-core.php';
        require_once JUGUEMOS_PATH . 'includes/Core/class-hooks.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin.php';
        require_once JUGUEMOS_PATH . 'includes/Core/class-assets.php';
        require_once JUGUEMOS_PATH . 'includes/Core/class-shortcodes.php';
        require_once JUGUEMOS_PATH . 'includes/Ajax/class-ajax.php';
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-categoria-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-deck-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-price-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Pricing/class-pricing.php';
        require_once JUGUEMOS_PATH . 'includes/Auth/class-login.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-categorias.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-dashboard.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-designs.php';
        require_once JUGUEMOS_PATH . 'includes/Ajax/class-admin-ajax.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-barajas.php';
        require_once JUGUEMOS_PATH . 'includes/Files/class-files.php';
        require_once JUGUEMOS_PATH . 'includes/Payment/class-paypal-handler.php';
        require_once JUGUEMOS_PATH . 'includes/Payment/class-paypal-return.php';
        require_once JUGUEMOS_PATH . 'includes/Payment/class-payment-settings.php';
    }


    private function init_plugin()
    {
        add_action('template_redirect', function() {
            // Verificar si estamos en una página que usa el shortcode [juguemos_admin]
            global $post;
            if (is_a($post, 'WP_Post') && has_shortcode($post->post_content, 'juguemos_admin')) {
                if (!is_user_logged_in() || !current_user_can('manage_options')) {
                    wp_redirect(home_url('/juguemos'));
                    exit;
                }
            }
        });

        new Juguemos_Core();
        new Juguemos_Shortcodes();
        new Juguemos_Ajax();
        new Juguemos_Login();
        new Juguemos_Admin_Ajax();
        new Juguemos_PayPal_Return();
    }

}
