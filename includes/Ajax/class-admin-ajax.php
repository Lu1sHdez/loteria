<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Admin_Ajax
{

    public function __construct()
    {

        add_action(
            'wp_ajax_juguemos_admin_designs',
            [$this, 'designs']
        );

        add_action(
            'wp_ajax_juguemos_create_category',
            [$this,'create_category']
        );
        add_action(
            'wp_ajax_juguemos_delete_category',
            [$this,'delete_category']
        );

    }

    public function designs()
    {

        $categoria_id = intval(
            $_GET['categoria_id'] ?? 0
        );

        if (!$categoria_id) {

            wp_send_json_error(
                'Categoría inválida.'
            );

        }
        $designs = Juguemos_Admin_Designs::get_by_category($categoria_id);

        ob_start();
        
        if(empty($designs)){
            ?>
            <p>No hay diseños registrados.</p>
            <?php
        }else{
        
            foreach($designs as $design){
            ?>
        
                <div class="j-admin-design-card">
        
                    <img
                        src="<?php echo esc_url($design->portada); ?>"
                        alt="<?php echo esc_attr($design->nombre); ?>">
        
                    <p>
                        <?php echo esc_html($design->nombre); ?>
                    </p>
        
                    <a href="#" class="j-admin-edit">
                        Editar
                    </a>
        
                </div>
        
            <?php
            }
        
        }
        
        wp_send_json_success(ob_get_clean());

    }
    public function create_category()
    {

        check_ajax_referer(
            'juguemos_admin_category',
            'nonce'
        );

        if(empty($_POST['nombre'])){

            wp_send_json_error();

        }

        $categoria = Juguemos_Admin_Categorias::create(
            $_POST['nombre']
        );

        wp_send_json_success($categoria);

    }
    public function delete_category()
    {

        check_ajax_referer(
            'juguemos_admin_category',
            'nonce'
        );

        Juguemos_Admin_Categorias::delete(
            intval($_POST['id'])
        );

        wp_send_json_success();

    }

}