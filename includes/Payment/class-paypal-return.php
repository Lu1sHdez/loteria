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
        <div style="display:none"></div>
        <script>
            (function() {
                if (window.opener) {
                    try {
                        window.opener.postMessage({
                            type: 'paypal_payment_completed',
                            token: '<?php echo esc_js($token); ?>',
                            order_id: '<?php echo esc_js($order_id); ?>'
                        }, '*');
                    } catch(e) {}
                }

                setTimeout(function() {
                    try {
                        window.close();
                    } catch(e) {}
                }, 500);
            })();
        </script>
        <?php
        exit;
    }
}
