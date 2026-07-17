<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Core
{

    public function __construct()
    {

        new Juguemos_Hooks();
        

        new Juguemos_Assets();
        if(is_admin()){

            new Juguemos_Admin();
    
        }

    }

}