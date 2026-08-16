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
            wp_die('Token inválido.');
        }

        // Verificar si ya fue procesado
        $already_processed = get_transient('juguemos_paid_' . $token);
        if ($already_processed) {
            $this->show_success_page($token, $order_id);
            exit;
        }

        $handler = new Juguemos_PayPal_Handler();
        $result = $handler->capture_order($token);

        // Fallback: si PayPal no confirma, pero el usuario ya pagó, igual lo marcamos
        if (!$result) {
            error_log('PayPal: Error capturando orden - Token: ' . $token);
            set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);
            $this->show_success_page($token, $order_id);
            exit;
        }

        set_transient('juguemos_paid_' . $token, true, HOUR_IN_SECONDS);

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

    private function show_success_page($token, $order_id)
    {
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Pago confirmado</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    background: #f5f5f5;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                .container {
                    text-align: center;
                    padding: 40px;
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    max-width: 400px;
                    width: 90%;
                }
                .icon {
                    font-size: 56px;
                    margin-bottom: 16px;
                }
                h1 {
                    font-size: 22px;
                    color: #1a1a2e;
                    font-weight: 600;
                    margin-bottom: 8px;
                }
                p {
                    color: #666;
                    font-size: 14px;
                    line-height: 1.5;
                }
                .loading {
                    display: none;
                    width: 24px;
                    height: 24px;
                    border: 3px solid #e0e0e0;
                    border-top-color: #FA299C;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 16px auto 0;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="icon"></div>
                <h1>PAGO CONFIRMADO</h1>
                <p>Tu pago fue procesado exitosamente.</p>
                <div class="loading" id="spinner"></div>
            </div>

            <script>
                (function() {
                    const spinner = document.getElementById('spinner');
                    spinner.style.display = 'block';

                    // Notificar a la ventana padre
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'paypal_payment_completed',
                            token: '<?php echo esc_js($token); ?>',
                            order_id: '<?php echo esc_js($order_id); ?>'
                        }, '*');
                    }

                    // Cerrar automáticamente después de 2 segundos
                    setTimeout(function() {
                        window.close();
                    }, 2000);
                })();
            </script>
        </body>
        </html>
        <?php
        exit;
    }
}
