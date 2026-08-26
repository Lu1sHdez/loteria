<?php
if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Stripe_Return
{
    public function __construct()
    {
        add_action('init', [$this, 'listen']);
    }

    public function listen()
    {
        // Escuchar el mismo patrón que PayPal
        if (empty($_GET['payment']) || $_GET['payment'] !== 'stripe_success') {
            return;
        }

        $session_id = sanitize_text_field($_GET['session_id'] ?? '');
        $order_id = sanitize_text_field($_GET['order_id'] ?? '');

        if (empty($session_id) || empty($order_id)) {
            wp_die('Parámetros inválidos.');
        }

        // Verificar si ya fue procesado
        $already_processed = get_transient('juguemos_paid_' . $order_id);
        if ($already_processed) {
            $this->show_success_page($session_id, $order_id);
            exit;
        }

        // Verificar con Stripe
        $handler = new Juguemos_Stripe_Handler();
        $result = $handler->get_session_status($session_id);

        // Determinar si el pago fue exitoso
        $payment_success = isset($result['payment_status']) && $result['payment_status'] === 'paid';

        if ($payment_success) {
            set_transient('juguemos_paid_' . $order_id, true, HOUR_IN_SECONDS);
            
            // Guardar datos del pedido (como PayPal)
            update_option('juguemos_order_' . $order_id, [
                'stripe_session_id' => $session_id,
                'amount' => $result['amount_total'] / 100 ?? 0,
                'currency' => strtoupper($result['currency'] ?? 'USD'),
                'status' => 'paid',
                'date' => current_time('mysql')
            ]);
        }

        $this->show_success_page($session_id, $order_id);
        exit;
    }

    private function show_success_page($session_id, $order_id)
    {
        ?>
        <script>
            (function() {
                if (window.opener) {
                    try {
                        window.opener.postMessage({
                            type: 'stripe_payment_completed',
                            session_id: '<?php echo esc_js($session_id); ?>',
                            order_id: '<?php echo esc_js($order_id); ?>',
                            success: true
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
