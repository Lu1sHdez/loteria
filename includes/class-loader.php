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
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-category-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-deck-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Repositories/class-price-repository.php';
        require_once JUGUEMOS_PATH . 'includes/Pricing/class-pricing.php';
        require_once JUGUEMOS_PATH . 'includes/Auth/class-auth.php';
        require_once JUGUEMOS_PATH . 'includes/Auth/class-login.php';
        require_once JUGUEMOS_PATH . 'includes/Auth/class-register.php';    
        require_once JUGUEMOS_PATH . 'includes/Auth/class-account.php';
        require_once JUGUEMOS_PATH . 'includes/Auth/class-auth-shortcodes.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-categorias.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-dashboard.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-designs.php';
        require_once JUGUEMOS_PATH . 'includes/Ajax/class-admin-ajax.php';
        require_once JUGUEMOS_PATH . 'admin/class-admin-barajas.php';
        require_once JUGUEMOS_PATH . 'includes/Files/class-files.php';

    }


    private function init_plugin()
    {

        new Juguemos_Core();
        new Juguemos_Shortcodes();
        new Juguemos_Ajax();
        new Juguemos_Login();
        new Juguemos_Admin_Ajax();

    }

}