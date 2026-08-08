<?php
/**
 * Endpoint standalone para crear la sesión de checkout de Stripe.
 * Se llama por fetch() directo desde pago.js (no pasa por admin-ajax.php),
 * por eso hay que bootstrapear WordPress manualmente.
 */

// Subir hasta la raíz de WordPress y cargar wp-load.php
require_once dirname(__FILE__, 6) . '/wp-load.php';

header('Content-Type: application/json');

// Leer el body JSON que manda pago.js
$input = json_decode(file_get_contents('php://input'), true);

$amount   = isset($input['amount']) ? floatval($input['amount']) : 0;
$currency = isset($input['currency']) ? sanitize_text_field($input['currency']) : 'usd';
$order_id = isset($input['order_id']) ? sanitize_text_field($input['order_id']) : '';

if (!$amount || !$order_id) {
    echo wp_json_encode([
        'error' => 'Datos incompletos para procesar el pago.'
    ]);
    exit;
}

if (!class_exists('Juguemos_Stripe_Handler')) {
    echo wp_json_encode([
        'error' => 'No se pudo cargar el manejador de Stripe.'
    ]);
    exit;
}

$handler = new Juguemos_Stripe_Handler();
$result  = $handler->create_checkout_session($amount, $currency, $order_id);

echo wp_json_encode($result);
exit;
