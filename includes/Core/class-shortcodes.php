<?php

if (!defined('ABSPATH')) {
    exit;
}


class Juguemos_Shortcodes
{


    public function __construct()
    {

        add_shortcode(
            'juguemos',
            [
                $this,
                'render'
            ]   
        );

        add_shortcode(
            'juguemos_login',
            [$this,'login']
        );
        add_shortcode(
            'juguemos_admin',
            [$this, 'admin']
        );

    }
    public function login()
    {

        ob_start();

        include JUGUEMOS_PATH .
        'public/templates/login.php';

        return ob_get_clean();

    }



    public function render()
    {


        ob_start();


        include JUGUEMOS_PATH .
        'public/templates/juguemos-app.php';


        return ob_get_clean();


    }
    public function admin()
    {
        ob_start();

        include JUGUEMOS_PATH . 'admin/views/dashboard.php';

        return ob_get_clean();
    }


}