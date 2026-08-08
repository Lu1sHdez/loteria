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
        add_action(
            'wp_ajax_juguemos_update_baraja_imagen',
            [$this, 'update_baraja_imagen']
        );
        add_action(
            'wp_ajax_juguemos_save_stripe',
            [$this, 'save_stripe']
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
    
    // 🔥 CAMBIO: Usar get_all_by_category en lugar de get_by_category
    $designs = Juguemos_Admin_Designs::get_all_by_category($categoria_id);

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

    // =========================================================
    // 🔥 MODIFICADO: CREAR BARAJAS (AHORA SOPORTA PNG)
    // =========================================================
    public function create_baraja()
    {
        if (!check_ajax_referer('juguemos_nonce', 'nonce', false)) {
            wp_send_json_error('Nonce inválido. Recarga la página e intenta nuevamente.');
            return;
        }

        $design_id = intval($_POST['design_id'] ?? 0);
        $numero    = intval($_POST['numero'] ?? 0);
        $nombre    = sanitize_text_field($_POST['nombre'] ?? '');

        if (!$design_id || !$numero || empty($nombre)) {
            wp_send_json_error('Datos incompletos. Design ID: ' . $design_id . ', Número: ' . $numero);
            return;
        }

        if (empty($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error('No se recibió la imagen correctamente.');
            return;
        }

        // 🔥 CAMBIO: Obtener la extensión real del archivo subido
        $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
        
        // 🔥 CAMBIO: Permitir WebP y PNG
        if (!in_array($extension, ['webp', 'png'])) {
            wp_send_json_error('Solo se permiten imágenes en formato WebP o PNG.');
            return;
        }

        // 🔥 CAMBIO: Usar la extensión real del archivo
        $archivo = sprintf('%02d.%s', $numero, $extension);

        $resultado = Juguemos_Files::upload_preview(
            $design_id,
            $_FILES['imagen'],
            $archivo
        );

        if (is_wp_error($resultado)) {
            wp_send_json_error($resultado->get_error_message());
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
            wp_send_json_error('No se pudo guardar en la base de datos: ' . $wpdb->last_error);
            return;
        }

        wp_send_json_success([
            'id'      => $id,
            'imagen'  => $archivo,
            'numero'  => $numero,
            'nombre'  => $nombre
        ]);
    }

    // =========================================================
    // 🔥 MODIFICADO: ACTUALIZAR BARAJAS (AHORA SOPORTA PNG)
    // =========================================================
    public function update_baraja()
    {
        check_ajax_referer(
            'juguemos_nonce',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if (!$id) {
            wp_send_json_error('Baraja inválida.');
            return;
        }

        $baraja = Juguemos_Admin_Barajas::get($id);

        if (!$baraja) {
            wp_send_json_error('La baraja no existe.');
            return;
        }

        $nombre = sanitize_text_field($_POST['nombre'] ?? '');
        $imagen = $baraja->imagen;

        if (!empty($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
            
            // 🔥 CAMBIO: Validar extensión
            $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
            if (!in_array($extension, ['webp', 'png'])) {
                wp_send_json_error('Solo se permiten imágenes en formato WebP o PNG.');
                return;
            }
            
            // 🔥 CAMBIO: Si es PNG, actualizar el nombre del archivo
            if ($extension === 'png') {
                $nombre_archivo = preg_replace('/\.webp$/i', '.png', $baraja->imagen);
                $imagen = $nombre_archivo;
            } else {
                $nombre_archivo = $baraja->imagen;
            }

            $resultado = Juguemos_Files::upload_preview(
                $baraja->design_id,
                $_FILES['imagen'],
                $nombre_archivo
            );

            if (is_wp_error($resultado)) {
                wp_send_json_error($resultado->get_error_message());
                return;
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

    // =========================================================
    // 🔥 MODIFICADO: ELIMINAR BARAJAS (AHORA ELIMINA AMBOS FORMATOS)
    // =========================================================
    public function delete_baraja()
    {
        check_ajax_referer(
            'juguemos_admin_baraja',
            'nonce'
        );

        $id = intval($_POST['id'] ?? 0);

        if (!$id) {
            wp_send_json_error('Baraja inválida.');
            return;
        }

        $baraja = Juguemos_Admin_Barajas::get($id);

        if (!$baraja) {
            wp_send_json_error('La baraja no existe.');
            return;
        }

        if (!empty($baraja->imagen)) {
            // 🔥 CAMBIO: Intentar eliminar tanto .webp como .png (por si hay versiones antiguas)
            $extensiones = ['webp', 'png'];
            foreach ($extensiones as $ext) {
                $nombre_alternativo = preg_replace('/\.[^.]+$/', '.' . $ext, $baraja->imagen);
                Juguemos_Files::delete_preview($baraja->design_id, $nombre_alternativo);
            }
            
            // Eliminar la imagen principal
            Juguemos_Files::delete_preview($baraja->design_id, $baraja->imagen);
        }

        Juguemos_Admin_Barajas::delete($id);

        wp_send_json_success();
    }

    // =========================================================
    // 🔥 MODIFICADO: ACTUALIZAR SOLO IMAGEN (AHORA SOPORTA PNG)
    // =========================================================
    public function update_baraja_imagen()
    {
        check_ajax_referer('juguemos_nonce', 'nonce');
        
        $id = intval($_POST['id'] ?? 0);
        
        if (!$id) {
            wp_send_json_error('ID de baraja inválido');
            return;
        }
        
        $baraja = Juguemos_Admin_Barajas::get($id);
        
        if (!$baraja) {
            wp_send_json_error('Baraja no encontrada');
            return;
        }
        
        if (empty($_FILES['imagen']) || $_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            wp_send_json_error('No se recibió la imagen correctamente');
            return;
        }
        
        // 🔥 CAMBIO: Validar WebP o PNG
        $extension = strtolower(pathinfo($_FILES['imagen']['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, ['webp', 'png'])) {
            wp_send_json_error('Solo se permiten imágenes en formato WebP o PNG');
            return;
        }
        
        // Validar tamaño (max 2MB)
        if ($_FILES['imagen']['size'] > 2 * 1024 * 1024) {
            wp_send_json_error('La imagen no debe superar los 2MB');
            return;
        }
        
        // 🔥 CAMBIO: Si es PNG, actualizar el nombre del archivo
        $nombre_archivo = $baraja->imagen;
        if ($extension === 'png') {
            $nombre_archivo = preg_replace('/\.webp$/i', '.png', $baraja->imagen);
            
            // Actualizar el nombre en la base de datos
            global $wpdb;
            $wpdb->update(
                $wpdb->prefix . 'juguemos_barajas',
                ['imagen' => $nombre_archivo],
                ['id' => $id]
            );
        }
        
        // Subir nueva imagen (sobrescribir la existente)
        $resultado = Juguemos_Files::upload_preview(
            $baraja->design_id,
            $_FILES['imagen'],
            $nombre_archivo
        );
        
        if (is_wp_error($resultado)) {
            wp_send_json_error($resultado->get_error_message());
            return;
        }
        
        // Actualizar el updated_at en la base de datos
        global $wpdb;
        $wpdb->update(
            $wpdb->prefix . 'juguemos_barajas',
            ['updated_at' => current_time('mysql')],
            ['id' => $id]
        );
        
        // Forzar recarga con timestamp
        $image_url = Juguemos_Files::preview_url($baraja->design_id) . $nombre_archivo;
        $image_url_with_timestamp = $image_url . '?v=' . time();
        
        wp_send_json_success([
            'filename' => $nombre_archivo,
            'image_url' => $image_url_with_timestamp
        ]);
    }

    public function save_stripe()
    {
        check_ajax_referer(
            'juguemos_nonce',
            'nonce'
        );

        if (!current_user_can('manage_options')) {
            wp_send_json_error('No tienes permisos.');
            return;
        }

        $publishable_key = sanitize_text_field($_POST['publishable_key'] ?? '');
        $secret_key       = sanitize_text_field($_POST['secret_key'] ?? '');
        $mode             = sanitize_text_field($_POST['mode'] ?? 'test');

        if (empty($publishable_key) || empty($secret_key)) {
            wp_send_json_error('Debes ingresar la Publishable Key y la Secret Key.');
            return;
        }

        Juguemos_Payment_Settings::save_stripe_credentials(
            $publishable_key,
            $secret_key,
            $mode
        );

        wp_send_json_success('Credenciales de Stripe guardadas correctamente.');
    }

    // =========================================================
    // 🔥 MODIFICADO: CREAR BARAJAS EN BD (ACTUALIZA EXTENSIÓN)
    // =========================================================
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
