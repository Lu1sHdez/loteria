<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Admin
{
    public function __construct()
    {
        add_action(
            'admin_menu',
            [$this, 'menu']
        );

        // Guardar configuraciones
        add_action(
            'admin_init',
            [$this, 'save_settings']
        );
    }

    public function menu()
    {
        add_menu_page(
            'Juguemos',
            'Juguemos',
            'manage_options',
            'juguemos',
            [$this, 'dashboard'],
            'dashicons-grid-view',
            25
        );

        add_submenu_page(
            'juguemos',
            'Configuración de Pagos',
            'Pagos',
            'manage_options',
            'juguemos-payment-settings',
            [$this, 'payment_settings']
        );
    }

    public function dashboard()
    {
        echo "<h1>Juguemos</h1>";
        echo "<p>Administrador del generador de lotería</p>";
    }

    /**
     * Página de configuración de pagos
     */
    public function payment_settings()
    {
        // Verificar permisos
        if (!current_user_can('manage_options')) {
            wp_die('No tienes permisos para acceder a esta página.');
        }

        // Asegurar que la clase de configuración existe
        if (!class_exists('Juguemos_Payment_Settings')) {
            require_once JUGUEMOS_PATH . 'includes/Payment/class-payment-settings.php';
        }

        // Obtener credenciales actuales
        $paypal_creds = Juguemos_Payment_Settings::get_paypal_credentials();

        ?>
        <div class="wrap">
            <h1>Configuracion de Pagos</h1>
            <p class="description">Configura los metodos de pago disponibles para tu tienda.</p>

            <?php $this->render_messages(); ?>

            <!-- PayPal -->
            <div style="margin-top:20px;background:#fff;padding:20px;border:1px solid #ccd0d4;border-radius:4px;">
                <form method="post" action="">
                    <?php wp_nonce_field('juguemos_payment_settings', 'juguemos_payment_nonce'); ?>
                    <input type="hidden" name="section" value="paypal">

                    <h2>Configuracion de PayPal</h2>
                    <p class="description">Ingresa tus credenciales de PayPal para procesar pagos.</p>

                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="paypal_client_id">Client ID</label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="paypal_client_id" 
                                       name="paypal_client_id" 
                                       value="<?php echo esc_attr($paypal_creds['client_id']); ?>" 
                                       class="regular-text"
                                       placeholder="Ingresa tu Client ID de PayPal">
                                <p class="description">Obtén tu Client ID desde <a href="https://developer.paypal.com/dashboard/" target="_blank">PayPal Developer Dashboard</a></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="paypal_secret">Secret</label>
                            </th>
                            <td>
                                <input type="password" 
                                       id="paypal_secret" 
                                       name="paypal_secret" 
                                       value="<?php echo esc_attr($paypal_creds['secret']); ?>" 
                                       class="regular-text"
                                       placeholder="Ingresa tu Secret de PayPal">
                                <p class="description">Obtén tu Secret desde <a href="https://developer.paypal.com/dashboard/" target="_blank">PayPal Developer Dashboard</a></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="paypal_mode">Modo</label>
                            </th>
                            <td>
                                <select id="paypal_mode" name="paypal_mode">
                                    <option value="sandbox" <?php selected($paypal_creds['mode'], 'sandbox'); ?>>
                                        Sandbox (Pruebas)
                                    </option>
                                    <option value="live" <?php selected($paypal_creds['mode'], 'live'); ?>>
                                        Live (Produccion)
                                    </option>
                                </select>
                                <p class="description">
                                    <?php if ($paypal_creds['mode'] === 'sandbox'): ?>
                                        Estás en modo Sandbox. Usa cuentas de prueba.
                                    <?php else: ?>
                                        Estás en modo Live. Procesa pagos reales.
                                    <?php endif; ?>
                                </p>
                            </td>
                        </tr>
                    </table>

                    <p class="submit">
                        <button type="submit" name="save_payment_settings" class="button button-primary">
                            Guardar Configuracion
                        </button>
                    </p>
                </form>

                <!-- Estado de PayPal -->
                <div style="margin-top:20px;padding:20px;background:#f9f9f9;border-left:4px solid <?php echo $paypal_creds['is_configured'] ? '#46b450' : '#dc3232'; ?>;">
                    <h3>Estado de PayPal</h3>
                    <p>
                        <?php if ($paypal_creds['is_configured']): ?>
                            <strong style="color:#46b450;">Configurado correctamente</strong>
                            <br>
                            <span style="color:#666;font-size:13px;">
                                Modo: <strong><?php echo ucfirst($paypal_creds['mode']); ?></strong>
                            </span>
                        <?php else: ?>
                            <strong style="color:#dc3232;">No configurado</strong>
                            <br>
                            <span style="color:#666;font-size:13px;">
                                Necesitas ingresar tu Client ID y Secret para habilitar PayPal.
                            </span>
                        <?php endif; ?>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Guardar configuraciones
     */
    public function save_settings()
    {
        // Verificar nonce
        if (!isset($_POST['juguemos_payment_nonce']) || 
            !wp_verify_nonce($_POST['juguemos_payment_nonce'], 'juguemos_payment_settings')) {
            return;
        }

        // Verificar permisos
        if (!current_user_can('manage_options')) {
            return;
        }

        // Asegurar que la clase de configuración existe
        if (!class_exists('Juguemos_Payment_Settings')) {
            require_once JUGUEMOS_PATH . 'includes/Payment/class-payment-settings.php';
        }

        $section = $_POST['section'] ?? '';

        if ($section === 'paypal') {
            $client_id = sanitize_text_field($_POST['paypal_client_id'] ?? '');
            $secret = sanitize_text_field($_POST['paypal_secret'] ?? '');
            $mode = sanitize_text_field($_POST['paypal_mode'] ?? 'sandbox');

            Juguemos_Payment_Settings::save_paypal_credentials($client_id, $secret, $mode);

            // Añadir mensaje de éxito
            add_action('admin_notices', function() {
                ?>
                <div class="notice notice-success is-dismissible">
                    <p>Configuracion guardada correctamente.</p>
                </div>
                <?php
            });
        }
    }

    /**
     * Renderizar mensajes de estado
     */
    private function render_messages()
    {
        // Los mensajes se muestran a través de admin_notices
    }
}