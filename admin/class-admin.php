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
            'Configuracion de Pagos',
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
        $stripe_creds = Juguemos_Payment_Settings::get_stripe_credentials();
        $whatsapp = Juguemos_Payment_Settings::get_whatsapp_phone();
        $zelle = Juguemos_Payment_Settings::get_zelle_phone();
        $apple_pay = Juguemos_Payment_Settings::is_apple_pay_enabled();

        ?>
        <div class="wrap">
            <h1>Configuracion de Pagos</h1>
            <p class="description">Configura los metodos de pago disponibles para tu tienda.</p>

            <?php $this->render_messages(); ?>

            <!-- ==========================================
            TABS NAVEGACION
            ========================================== -->
            <nav class="nav-tab-wrapper">
                <a href="#paypal-tab" class="nav-tab nav-tab-active" data-tab="paypal">PayPal</a>
                <a href="#stripe-tab" class="nav-tab" data-tab="stripe">Stripe</a>
                <a href="#other-tab" class="nav-tab" data-tab="other">Otros Metodos</a>
            </nav>

            <!-- ==========================================
            TAB PAYPAL (ACTIVO)
            ========================================== -->
            <div id="paypal-tab" class="tab-content">
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
                            Guardar Configuracion PayPal
                        </button>
                    </p>
                </form>

                <!-- Estado de PayPal -->
                <div class="status-card <?php echo $paypal_creds['is_configured'] ? 'status-success' : 'status-error'; ?>">
                    <h3>Estado de PayPal</h3>
                    <p>
                        <?php if ($paypal_creds['is_configured']): ?>
                            <strong class="text-success">Configurado correctamente</strong>
                            <br>
                            <span class="text-muted">
                                Modo: <strong><?php echo ucfirst($paypal_creds['mode']); ?></strong>
                            </span>
                        <?php else: ?>
                            <strong class="text-error">No configurado</strong>
                            <br>
                            <span class="text-muted">
                                Necesitas ingresar tu Client ID y Secret para habilitar PayPal.
                            </span>
                        <?php endif; ?>
                    </p>
                </div>
            </div>
            <!-- ==========================================
            TAB STRIPE (ACTIVADO)
            ========================================== -->
            <div id="stripe-tab" class="tab-content" style="display:none;">

                <form method="post" action="">
                    <?php wp_nonce_field('juguemos_payment_settings', 'juguemos_payment_nonce'); ?>
                    <input type="hidden" name="section" value="stripe">

                    <h2>Configuración de Stripe</h2>
                    <p class="description">Ingresa tus credenciales de Stripe para procesar pagos con tarjeta.</p>

                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="stripe_publishable_key">Publishable Key</label>
                            </th>
                            <td>
                                <input type="text" 
                                    id="stripe_publishable_key" 
                                    name="stripe_publishable_key" 
                                    value="<?php echo esc_attr($stripe_creds['publishable_key']); ?>" 
                                    class="regular-text"
                                    placeholder="pk_test_...">
                                <p class="description">Obtén tu Publishable Key desde <a href="https://dashboard.stripe.com/apikeys" target="_blank">Stripe Dashboard</a></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="stripe_secret_key">Secret Key</label>
                            </th>
                            <td>
                                <input type="password" 
                                    id="stripe_secret_key" 
                                    name="stripe_secret_key" 
                                    value="<?php echo esc_attr($stripe_creds['secret_key']); ?>" 
                                    class="regular-text"
                                    placeholder="sk_test_...">
                                <p class="description">Obtén tu Secret Key desde <a href="https://dashboard.stripe.com/apikeys" target="_blank">Stripe Dashboard</a></p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="stripe_mode">Modo</label>
                            </th>
                            <td>
                                <select id="stripe_mode" name="stripe_mode">
                                    <option value="test" <?php selected($stripe_creds['mode'] ?? 'test', 'test'); ?>>
                                        Test (Pruebas)
                                    </option>
                                    <option value="live" <?php selected($stripe_creds['mode'] ?? 'test', 'live'); ?>>
                                        Live (Producción)
                                    </option>
                                </select>
                            </td>
                        </tr>
                    </table>

                    <p class="submit">
                        <button type="submit" name="save_payment_settings" class="button button-primary">
                            Guardar Configuración Stripe
                        </button>
                    </p>
                </form>

                <!-- Estado de Stripe -->
                <div class="status-card <?php echo $stripe_creds['is_configured'] ? 'status-success' : 'status-error'; ?>">
                    <h3>Estado de Stripe</h3>
                    <p>
                        <?php if ($stripe_creds['is_configured']): ?>
                            <strong class="text-success">Configurado correctamente</strong>
                            <br>
                            <span class="text-muted">
                                Modo: <strong><?php echo ucfirst($stripe_creds['mode'] ?? 'test'); ?></strong>
                            </span>
                        <?php else: ?>
                            <strong class="text-error">No configurado</strong>
                            <br>
                            <span class="text-muted">
                                Necesitas ingresar tu Publishable Key y Secret Key para habilitar Stripe.
                            </span>
                        <?php endif; ?>
                    </p>
                </div>
            </div>

            <!-- ==========================================
            TAB OTROS METODOS (PREPARADO PARA FUTURO)
            ========================================== -->
            <div id="other-tab" class="tab-content" style="display:none;">
                <div style="background:#f0f6ff;padding:15px;border-radius:4px;margin-bottom:20px;border-left:4px solid #0073aa;">
                    <p style="margin:0;color:#0073aa;">
                        <strong>Proximamente</strong> - Mas metodos de pago estaran disponibles en versiones futuras.
                    </p>
                </div>

                

                <form method="post" action="">
                    <?php wp_nonce_field('juguemos_payment_settings', 'juguemos_payment_nonce'); ?>
                    <input type="hidden" name="section" value="other">

                    <h2>Otros Metodos de Pago</h2>
                    <p class="description">Configura metodos de pago adicionales.</p>

                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="whatsapp_phone">Telefono WhatsApp</label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="whatsapp_phone" 
                                       name="whatsapp_phone" 
                                       value="<?php echo esc_attr($whatsapp); ?>" 
                                       class="regular-text"
                                       placeholder="+52 123 456 7890">
                                <p class="description">Numero de WhatsApp para contacto (con codigo de pais).</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="zelle_phone">Telefono Zelle</label>
                            </th>
                            <td>
                                <input type="text" 
                                       id="zelle_phone" 
                                       name="zelle_phone" 
                                       value="<?php echo esc_attr($zelle); ?>" 
                                       class="regular-text"
                                       placeholder="+1 832 350 3646">
                                <p class="description">Numero de telefono asociado a Zelle.</p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="apple_pay_enabled">Apple Pay</label>
                            </th>
                            <td>
                                <label>
                                    <input type="checkbox" 
                                           id="apple_pay_enabled" 
                                           name="apple_pay_enabled" 
                                           value="1" 
                                           <?php checked($apple_pay, true); ?>>
                                    Habilitar Apple Pay
                                </label>
                                <p class="description">Permite pagos con Apple Pay (requiere configuracion adicional).</p>
                            </td>
                        </tr>
                    </table>

                    <p class="submit">
                        <button type="submit" name="save_payment_settings" class="button button-primary">
                            Guardar Configuracion
                        </button>
                    </p>
                </form>
            </div>
        </div>

        <style>
            .tab-content {
                background: #fff;
                padding: 20px;
                border: 1px solid #ccd0d4;
                border-radius: 0 4px 4px 4px;
                margin-top: -1px;
            }
            .tab-content h2 {
                margin-top: 0;
            }
            .nav-tab-wrapper {
                margin-bottom: 0;
                border-bottom: 1px solid #ccd0d4;
            }
            .nav-tab-active {
                background: #fff;
                border-bottom-color: #fff;
            }
            .status-card {
                margin-top: 20px;
                padding: 20px;
                background: #f9f9f9;
                border-radius: 4px;
                border-left: 4px solid #46b450;
            }
            .status-error {
                border-left-color: #dc3232;
            }
            .text-success {
                color: #46b450;
            }
            .text-error {
                color: #dc3232;
            }
            .text-muted {
                color: #666;
                font-size: 13px;
            }
        </style>

        <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Manejar tabs
            const tabs = document.querySelectorAll('.nav-tab');
            const contents = {
                'paypal': document.getElementById('paypal-tab'),
                'stripe': document.getElementById('stripe-tab'),
                'other': document.getElementById('other-tab')
            };

            tabs.forEach(tab => {
                tab.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Quitar active de todos
                    tabs.forEach(t => t.classList.remove('nav-tab-active'));
                    this.classList.add('nav-tab-active');
                    
                    // Ocultar todos los contenidos
                    Object.values(contents).forEach(content => {
                        if (content) content.style.display = 'none';
                    });
                    
                    // Mostrar el contenido seleccionado
                    const target = this.getAttribute('data-tab');
                    if (contents[target]) {
                        contents[target].style.display = 'block';
                    }
                });
            });

            // Si hay un hash en la URL, activar el tab correspondiente
            if (window.location.hash) {
                const hash = window.location.hash.replace('#', '');
                const tab = document.querySelector(`.nav-tab[data-tab="${hash}"]`);
                if (tab) {
                    tab.click();
                }
            }
        });
        </script>
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

        switch ($section) {
            case 'paypal':
                $this->save_paypal_settings();
                break;
            case 'stripe':
                $this->save_stripe_settings();
                break;
            case 'other':
                $this->save_other_settings();
                break;
        }

        // Añadir mensaje de éxito
        add_action('admin_notices', function() {
            ?>
            <div class="notice notice-success is-dismissible">
                <p>Configuracion guardada correctamente.</p>
            </div>
            <?php
        });
    }

    /**
     * Guardar configuración de PayPal
     */
    private function save_paypal_settings()
    {
        $client_id = sanitize_text_field($_POST['paypal_client_id'] ?? '');
        $secret = sanitize_text_field($_POST['paypal_secret'] ?? '');
        $mode = sanitize_text_field($_POST['paypal_mode'] ?? 'sandbox');

        Juguemos_Payment_Settings::save_paypal_credentials($client_id, $secret, $mode);
    }

    /**
     * Guardar configuración de Stripe (preparado)
     */
    private function save_stripe_settings()
    {
        $publishable_key = sanitize_text_field($_POST['stripe_publishable_key'] ?? '');
        $secret_key = sanitize_text_field($_POST['stripe_secret_key'] ?? '');
        $mode = sanitize_text_field($_POST['stripe_mode'] ?? 'test');

        update_option('juguemos_stripe_publishable_key', $publishable_key);
        update_option('juguemos_stripe_secret_key', $secret_key);
        update_option('juguemos_stripe_mode', $mode);
    }

    /**
     * Guardar otros métodos de pago
     */
    private function save_other_settings()
    {
        $whatsapp = sanitize_text_field($_POST['whatsapp_phone'] ?? '');
        $zelle = sanitize_text_field($_POST['zelle_phone'] ?? '');
        $apple_pay = isset($_POST['apple_pay_enabled']) ? '1' : '';

        update_option('juguemos_whatsapp_phone', $whatsapp);
        update_option('juguemos_zelle_phone', $zelle);
        update_option('juguemos_apple_pay_enabled', $apple_pay);
    }

    /**
     * Renderizar mensajes de estado
     */
    private function render_messages()
    {
        // Los mensajes se muestran a través de admin_notices
    }
}
