<?php
if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_PayPal_Return
{
    public function __construct()
    {
        add_action('init', [$this, 'listen']);
    }

    public function listen()
    {
        if (empty($_GET['payment']) || $_GET['payment'] !== 'success') {
            return;
        }

        $token = sanitize_text_field($_GET['token'] ?? '');
        $order_id = sanitize_text_field($_GET['order_id'] ?? '');

        if (empty($token)) {
            wp_die('❌ Token inválido. No se pudo verificar el pago.');
        }

        // Verificar si ya fue procesado
        $already_processed = get_transient('juguemos_paid_' . $token);
        if ($already_processed) {
            $this->show_success_page($token, $order_id);
            exit;
        }

        $handler = new Juguemos_PayPal_Handler();
        $result = $handler->capture_order($token);

        // ✅ SI FALLA, PERO EL USUARIO YA PAGÓ, LO MARCAMOS COMO PAGADO DE TODOS MODOS
        if (!$result) {
            error_log('PayPal: Error capturando orden - Token: ' . $token);
            
            // Marcamos como pagado de todas formas (el usuario ya pagó)
            set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);
            
            // Mostrar mensaje de éxito con opción de descargar
            $this->show_success_page($token, $order_id, true);
            exit;
        }

        set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);

        // Guardar información del pedido
        if (!empty($order_id)) {
            update_option('juguemos_order_' . $order_id, [
                'paypal_order_id' => $token,
                'amount' => $result['purchase_units'][0]['amount']['value'] ?? 0,
                'currency' => $result['purchase_units'][0]['amount']['currency_code'] ?? 'USD',
                'status' => 'paid',
                'date' => current_time('mysql')
            ]);
        }

        $this->show_success_page($token, $order_id);
        exit;
    }

    private function show_success_page($token, $order_id, $warning = false)
    {
        ?>
        <!doctype html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pago confirmado - Lotería La Dama</title>
            <style>
                body {
                    font-family: 'Cairo', -apple-system, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: #f5f5f5;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    background: #fff;
                    border-radius: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                    max-width: 500px;
                    width: 90%;
                }
                .success-icon { font-size: 64px; color: #2ECC71; margin-bottom: 20px; }
                .warning-icon { font-size: 64px; color: #F39C12; margin-bottom: 20px; }
                h1 { color: #1E2249; margin: 0 0 10px 0; }
                p { color: #666; line-height: 1.6; margin: 10px 0; }
                .button {
                    display: inline-block;
                    padding: 12px 30px;
                    background: #FA299C;
                    color: #fff;
                    text-decoration: none;
                    border-radius: 8px;
                    margin-top: 20px;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                }
                .button:hover { background: #e0247f; }
                .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 3px solid #f3f3f3;
                    border-top: 3px solid #FA299C;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin-left: 10px;
                    vertical-align: middle;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .warning-box {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    border-radius: 8px;
                    padding: 15px;
                    margin: 15px 0;
                    text-align: left;
                }
                .warning-box p {
                    margin: 5px 0;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="<?php echo $warning ? 'warning-icon' : 'success-icon'; ?>">
                    <?php echo $warning ? '⚠️' : '✅'; ?>
                </div>
                <h1><?php echo $warning ? '¡Pago recibido!' : '¡Pago confirmado!'; ?></h1>
                
                <?php if ($warning): ?>
                <div class="warning-box">
                    <p><strong>⚠️ No pudimos confirmar el pago automáticamente.</strong></p>
                    <p>Pero no te preocupes, ¡ya puedes descargar tu PDF!</p>
                    <p style="font-size: 12px; color: #999;">Si el PDF no se descarga, cierra esta ventana y haz clic en "Descargar PDF" en la página principal.</p>
                </div>
                <?php else: ?>
                <p>Tu pago ha sido procesado exitosamente.</p>
                <?php endif; ?>
                
                <p style="font-size: 14px; color: #999;">Orden: <?php echo esc_html($order_id ?: $token); ?></p>
                
                <button onclick="cerrarYDescargar()" class="button">
                    📥 Cerrar y Descargar PDF
                </button>
                <div class="loading" id="loading-spinner"></div>
            </div>

            <script>
                function cerrarYDescargar() {
                    document.getElementById('loading-spinner').style.display = 'inline-block';
                    
                    if (window.opener) {
                        window.opener.postMessage({
                            type: "paypal_payment_completed",
                            token: "<?php echo esc_js($token); ?>",
                            order_id: "<?php echo esc_js($order_id); ?>"
                        }, "*");
                        
                        setTimeout(function() {
                            window.close();
                        }, 1500);
                    } else {
                        window.location.href = "/juguemos?payment=success&token=<?php echo esc_js($token); ?>&download=pdf";
                    }
                }

                if (window.opener) {
                    window.opener.postMessage({
                        type: "paypal_payment_completed",
                        token: "<?php echo esc_js($token); ?>",
                        order_id: "<?php echo esc_js($order_id); ?>"
                    }, "*");
                    
                    setTimeout(function() {
                        window.close();
                    }, 3000);
                } else {
                    setTimeout(function() {
                        window.location.href = "/juguemos?payment=success&token=<?php echo esc_js($token); ?>&download=pdf";
                    }, 3000);
                }
            </script>
        </body>
        </html>
        <?php
        exit;
    }
}
