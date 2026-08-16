<?php
// /wp-content/plugins/juguemos/public/templates/payment/paypal-simple.php
// VERSIÓN LIMPIA - SOLO USA BD

// Cargar WordPress
$wp_load = dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php';
if (!file_exists($wp_load)) {
    $wp_load = $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
}
if (!file_exists($wp_load)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No se encontró wp-load.php']);
    exit;
}
require_once($wp_load);

header('Content-Type: application/json');

// ============================================
// VERIFICAR NONCE
// ============================================
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['nonce']) || !wp_verify_nonce($input['nonce'], 'juguemos_nonce')) {
    error_log('PayPal: Nonce inválido - ' . ($input['nonce'] ?? 'null'));
    echo json_encode(['error' => 'Nonce inválido. Recarga la página.']);
    exit;
}

// ============================================
// OBTENER DATOS
// ============================================
$amount = floatval($input['amount'] ?? 0);
$currency = sanitize_text_field($input['currency'] ?? 'USD');
$order_id = sanitize_text_field($input['order_id'] ?? '');

if ($amount <= 0 || empty($order_id)) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

// ============================================
// VERIFICAR CONFIGURACIÓN
// ============================================
$creds = Juguemos_Payment_Settings::get_paypal_credentials();

if (!$creds['is_configured']) {
    error_log('PayPal: Credenciales no configuradas en BD');
    echo json_encode([
        'error' => 'PayPal no está configurado. Contacta al administrador.'
    ]);
    exit;
}

// ============================================
// CREAR ORDEN
// ============================================
if (!class_exists('Juguemos_PayPal_Handler')) {
    require_once JUGUEMOS_PATH . 'includes/Payment/class-paypal-handler.php';
}

$handler = new Juguemos_PayPal_Handler();

error_log('PayPal: Creando orden $' . $amount . ' ' . $currency . ' (Order: ' . $order_id . ')');

$result = $handler->create_order($amount, $currency, $order_id);

if ($result) {
    $token = '';
    if (preg_match('/token=([A-Za-z0-9_-]+)/', $result, $matches)) {
        $token = $matches[1];
    }
    
    echo json_encode([
        'success' => true,
        'approve_url' => $result,
        'token' => $token,
        'order_id' => $order_id,
        'mode' => $creds['mode']
    ]);
} else {
    error_log('PayPal: Error al crear orden');
    echo json_encode([
        'error' => 'No se pudo crear la orden de pago. Verifica las credenciales de PayPal.'
    ]);
}
