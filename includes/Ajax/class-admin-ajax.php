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
        add_action(
            'wp_ajax_juguemos_delete_design',
            [$this,'delete_design']
        );
        add_action(
            'wp_ajax_juguemos_create_baraja',
            [$this,'create_baraja']
        );
        
        add_action(
            'wp_ajax_juguemos_update_baraja',
            [$this,'update_baraja']
        );
        
        add_action(
            'wp_ajax_juguemos_delete_baraja',
            [$this,'delete_baraja']
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
        
                    <div class="j-admin-card-actions">

                        <a
                            href="?view=edit-design&id=<?php echo $design->id; ?>"
                            class="j-admin-edit">

                            Editar

                        </a>

                        <button
                            type="button"
                            class="j-admin-delete"
                            data-id="<?php echo $design->id; ?>">

                            Eliminar

                        </button>

                    </div>
        
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

    public function delete_design()
    {
        check_ajax_referer(
            'juguemos_admin_design',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if(!$id){
            wp_send_json_error(
                'Diseño inválido.'
            );
        }
        Juguemos_Admin_Designs::delete($id);

        wp_send_json_success();

    }
    public function create_baraja()
    {

        check_ajax_referer(
            'juguemos_admin_baraja',
            'nonce'
        );

        $design_id = intval($_POST['design_id'] ?? 0);
        $numero    = intval($_POST['numero'] ?? 0);
        $nombre    = sanitize_text_field($_POST['nombre'] ?? '');
        $imagen    = sanitize_text_field($_POST['imagen'] ?? '');

        if(
            !$design_id ||
            !$numero ||
            empty($nombre)
        ){

            wp_send_json_error(
                'Datos incompletos.'
            );

        }

        $id = Juguemos_Admin_Barajas::create([

            'design_id' => $design_id,
            'numero'    => $numero,
            'nombre'    => $nombre,
            'imagen'    => $imagen

        ]);

        wp_send_json_success([

            'id'=>$id

        ]);

    }
    public function update_baraja()
    {

        check_ajax_referer(
            'juguemos_admin_baraja',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if(!$id){

            wp_send_json_error(
                'Baraja inválida.'
            );

        }

        Juguemos_Admin_Barajas::update(

            $id,

            [

                'nombre' => sanitize_text_field(
                    $_POST['nombre']
                ),

                'imagen' => sanitize_text_field(
                    $_POST['imagen']
                )

            ]

        );

        wp_send_json_success();

    }
    public function delete_baraja()
    {

        check_ajax_referer(
            'juguemos_admin_baraja',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if(!$id){

            wp_send_json_error(
                'Baraja inválida.'
            );

        }

        Juguemos_Admin_Barajas::delete($id);

        wp_send_json_success();

    }

}