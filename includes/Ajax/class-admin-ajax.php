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
                    <div class="j-design-image-wrapper">
                        <img
                            src="<?php echo Juguemos_Admin_Designs::get_portada($design); ?>"
                            alt="<?php echo esc_attr($design->nombre); ?>">
                    </div>
                    
                    <p class="j-admin-design-nombre">
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

        error_log('Nonce recibido: ' . ($_POST['nonce'] ?? 'no enviado'));
    
        check_ajax_referer('juguemos_nonce', 'nonce');
    
        check_ajax_referer(
            'juguemos_nonce',
            'nonce'
        );
    
        $design_id = intval($_POST['design_id'] ?? 0);
        $numero    = intval($_POST['numero'] ?? 0);
        $nombre    = sanitize_text_field($_POST['nombre'] ?? '');
    
        if (
            !$design_id ||
            !$numero ||
            empty($nombre)
        ) {
    
            wp_send_json_error(
                'Datos incompletos.'
            );
    
            return;
    
        }
    
        if (
            empty($_FILES['imagen']) ||
            $_FILES['imagen']['error'] !== UPLOAD_ERR_OK
        ) {
    
            wp_send_json_error(
                'No se recibió la imagen.'
            );
    
            return;
    
        }
    
        $archivo = sprintf(
            '%02d.webp',
            $numero
        );
    
        $resultado = Juguemos_Files::upload_preview(
    
            $design_id,
    
            $_FILES['imagen'],
    
            $archivo
    
        );
    
        if (is_wp_error($resultado)) {
    
            wp_send_json_error(
                $resultado->get_error_message()
            );
    
            return;
    
        }
    
        $id = Juguemos_Admin_Barajas::create([
    
            'design_id' => $design_id,
    
            'numero'    => $numero,
    
            'nombre'    => $nombre,
    
            'imagen'    => $archivo
    
        ]);
    
        if (!$id) {
    
            global $wpdb;
    
            wp_send_json_error(
                'No se pudo guardar en la base de datos: ' . $wpdb->last_error
            );
    
            return;
    
        }
    
        wp_send_json_success([
    
            'id'      => $id,
    
            'imagen'  => $archivo
    
        ]);
    
    }
    public function update_baraja()
    {

        check_ajax_referer(
            'juguemos_nonce',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if (!$id) {

            wp_send_json_error(
                'Baraja inválida.'
            );

        }

        $baraja = Juguemos_Admin_Barajas::get($id);

        if (!$baraja) {

            wp_send_json_error(
                'La baraja no existe.'
            );

        }

        $nombre = sanitize_text_field(
            $_POST['nombre'] ?? ''
        );

        $imagen = $baraja->imagen;

        if (
            !empty($_FILES['imagen']) &&
            $_FILES['imagen']['error'] === UPLOAD_ERR_OK
        ) {

            $resultado = Juguemos_Files::upload_preview(

                $baraja->design_id,

                $_FILES['imagen'],

                $baraja->imagen

            );

            if (is_wp_error($resultado)) {

                wp_send_json_error(
                    $resultado->get_error_message()
                );

            }

        }

        Juguemos_Admin_Barajas::update(

            $id,

            [

                'nombre' => $nombre,

                'imagen' => $imagen

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

            return;

        }

        $baraja = Juguemos_Admin_Barajas::get($id);

        if (!$baraja) {

            wp_send_json_error(
                'La baraja no existe.'
            );

            return;

        }

        if (!empty($baraja->imagen)) {

            Juguemos_Files::delete_preview(
                $baraja->design_id,
                $baraja->imagen
            );

        }

        Juguemos_Admin_Barajas::delete($id);

        wp_send_json_success();

    }

    public static function create($data)
{
    global $wpdb;
    
    $design_id = intval($data['design_id']);
    $numero = intval($data['numero']);
    $nombre = sanitize_text_field($data['nombre']);
    $slug = sanitize_title($nombre);
    $imagen = sanitize_text_field($data['imagen']);
    
    // Verificar si ya existe una baraja inactiva con este número
    $existe_inactiva = $wpdb->get_var($wpdb->prepare(
        "SELECT id FROM {$wpdb->prefix}juguemos_barajas 
        WHERE design_id = %d AND numero = %d AND activo = 0",
        $design_id, $numero
    ));
    
    if ($existe_inactiva) {
        // Reactivar la baraja existente
        $wpdb->update(
            $wpdb->prefix . 'juguemos_barajas',
            [
                'nombre' => $nombre,
                'slug' => $slug,
                'imagen' => $imagen,
                'activo' => 1,
                'orden' => $numero
            ],
            ['id' => $existe_inactiva],
            ['%s', '%s', '%s', '%d', '%d'],
            ['%d']
        );
        return $existe_inactiva;
    }
    
    // Si no existe inactiva, crear nueva
    $wpdb->insert(
        $wpdb->prefix . 'juguemos_barajas',
        [
            'design_id' => $design_id,
            'numero'    => $numero,
            'nombre'    => $nombre,
            'slug'      => $slug,
            'imagen'    => $imagen,
            'orden'     => $numero,
            'activo'    => 1
        ]
    );
    
    return $wpdb->insert_id;
}

}