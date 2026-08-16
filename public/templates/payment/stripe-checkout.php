<?php
// ============================================================
// STRIPE CHECKOUT - ENDPOINT PARA PROCESAR PAGOS
// ============================================================
// Ruta: /wp-content/plugins/juguemos/public/templates/payment/stripe-checkout.php

// Cargar WordPress
$wp_load = dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php';

if (!file_exists($wp_load)) {
    $wp_load = $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
}

if (!file_exists($wp_load)) {
    $wp_load = dirname(dirname(dirname(dirname(dirname(dirname(__FILE__)))))) . '/wp-load.php';
}

if (!file_exists($wp_load)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No se encontró wp-load.php']);
    exit;
}

require_once($wp_load);

header('Content-Type: application/json');

// ============================================================
// VERIFICAR QUE LA CLASE EXISTE
// ============================================================
if (!class_exists('Juguemos_Payment_Settings')) {
    $settings_path = JUGUEMOS_PATH . 'includes/Payment/class-payment-settings.php';
    if (file_exists($settings_path)) {
        require_once($settings_path);
    } else {
        echo json_encode(['error' => 'No se encontró la clase de configuración de pagos']);
        exit;
    }
}

if (!class_exists('Juguemos_Stripe_Handler')) {
    $handler_path = JUGUEMOS_PATH . 'includes/Payment/class-stripe-handler.php';
    if (file_exists($handler_path)) {
        require_once($handler_path);
    } else {
        echo json_encode(['error' => 'No se encontró el handler de Stripe']);
        exit;
    }
}

// ============================================================
// RECIBIR DATOS
// ============================================================
$input = json_decode(file_get_contents('php://input'), true);

$amount = floatval($input['amount'] ?? 0);
$currency = sanitize_text_field($input['currency'] ?? 'USD');
$order_id = sanitize_text_field($input['order_id'] ?? '');

if ($amount <= 0 || empty($order_id)) {
    echo json_encode([
        'error' => 'Datos incompletos para procesar el pago.'
    ]);
    exit;
}

// ============================================================
// VERIFICAR CREDENCIALES
// ============================================================
$creds = Juguemos_Payment_Settings::get_stripe_credentials();

if (!$creds['is_configured']) {
    error_log('Stripe: Credenciales no configuradas');
    echo json_encode([
        'error' => 'Stripe no está configurado. Contacta al administrador.'
    ]);
    exit;
}

// ============================================================
// CREAR SESIÓN DE CHECKOUT
// ============================================================
$handler = new Juguemos_Stripe_Handler();

error_log('Stripe: Creando sesión - Monto: $' . $amount . ' ' . $currency . ' | Order: ' . $order_id);

$result = $handler->create_checkout_session($amount, $currency, $order_id);

if (isset($result['success']) && $result['success']) {
    error_log('Stripe: Sesión creada - ID: ' . $result['session_id']);
    echo json_encode($result);
} else {
    error_log('Stripe: Error - ' . ($result['error'] ?? 'Error desconocido'));
    echo json_encode([
        'error' => $result['error'] ?? 'Error al crear sesión de pago'
    ]);
}
exit;
