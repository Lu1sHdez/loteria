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

    }



    public function render()
    {


        ob_start();


        include JUGUEMOS_PATH .
        'public/templates/juguemos-app.php';


        return ob_get_clean();


    }


}