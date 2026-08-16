<?php
if (!defined('ABSPATH')) {
    exit;
}

// ============================================================
// STRIPE RETURN - CIERRA LA VENTANA EMERGENTE (ESTILO PAYPAL)
// ============================================================

if (empty($_GET['session_id']) || empty($_GET['order_id'])) {
    wp_die('Parámetros inválidos');
}

$session_id = sanitize_text_field($_GET['session_id']);
$order_id = sanitize_text_field($_GET['order_id']);

// Cargar WordPress
$wp_load = dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php';
if (!file_exists($wp_load)) {
    $wp_load = $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
}
if (!file_exists($wp_load)) {
    wp_die('No se encontró WordPress');
}
require_once($wp_load);

// Verificar que Stripe esté configurado
if (!class_exists('Juguemos_Stripe_Handler')) {
    require_once JUGUEMOS_PATH . 'includes/Payment/class-stripe-handler.php';
}

$handler = new Juguemos_Stripe_Handler();
$result = $handler->get_session_status($session_id);

// Determinar si el pago fue exitoso
$payment_success = isset($result['payment_status']) && $result['payment_status'] === 'paid';
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
            border-top-color: #635BFF;
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
        <div class="icon">✅</div>
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
                    type: 'stripe_payment_completed',
                    session_id: '<?php echo esc_js($session_id); ?>',
                    order_id: '<?php echo esc_js($order_id); ?>',
                    success: <?php echo $payment_success ? 'true' : 'false'; ?>
                }, '*');
            }

            // Cerrar automáticamente después de 2 segundos (como PayPal)
            setTimeout(function() {
                window.close();
            }, 2000);

            setTimeout(function() {
                if (!window.closed) {
                    window.location.href = '/juguemos?payment=stripe_success&session_id=<?php echo esc_js($session_id); ?>&order_id=<?php echo esc_js($order_id); ?>';
                }
            }, 2000);
        })();
    </script>
</body>
</html>
