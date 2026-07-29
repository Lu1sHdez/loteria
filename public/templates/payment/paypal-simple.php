<?php
// paypal-simple.php - Pago directo con PayPal

// ============================================
// CARGAR WORDPRESS
// ============================================
$wp_load = dirname(dirname(dirname(dirname(dirname(__FILE__))))) . '/wp-load.php';

if (!file_exists($wp_load)) {
    $wp_load = $_SERVER['DOCUMENT_ROOT'] . '/wp-load.php';
}

if (!file_exists($wp_load)) {
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No se encontró wp-load.php en: ' . $wp_load]);
    exit;
}

require_once($wp_load);

// ============================================
// CONFIGURACIÓN DE PAYPAL (¡PON TUS CREDENCIALES AQUÍ!)
// ============================================
$PAYPAL_CLIENT_ID = 'AdXfjZWOlv8SCVN4yEdhO2nHDivAhmHN1Fcc7EVwAZXubomlzryq76BxxQJx-TeK5cJBXtWCpY02MwlA';
$PAYPAL_SECRET = 'ENBa3gia-huRkVAWERCAyoqgFdUytEecUOaUicYldZXtLuXThC6GOWjRz4c4ayWF96nlPNM-hp0HOJqE';
$PAYPAL_MODE = 'sandbox';

// ============================================
// RECIBIR DATOS DEL FRONTEND
// ============================================
$input = json_decode(file_get_contents('php://input'), true);
$amount = floatval($input['amount'] ?? 1.00);
$currency = $input['currency'] ?? 'USD';
$description = $input['description'] ?? 'Lotería La Dama';

// ============================================
// CREAR ORDEN EN PAYPAL (CON OAuth 2.0)
// ============================================
function paypal_create_order($amount, $currency, $description) {
    global $PAYPAL_CLIENT_ID, $PAYPAL_SECRET, $PAYPAL_MODE;
    
    $api_url = $PAYPAL_MODE === 'live' 
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    
    // 1. OBTENER ACCESS TOKEN
    $auth = base64_encode($PAYPAL_CLIENT_ID . ':' . $PAYPAL_SECRET);
    
    $ch = curl_init($api_url . '/v1/oauth2/token');
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Basic ' . $auth,
        'Content-Type: application/x-www-form-urlencoded'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $token_resp = curl_exec($ch);
    $token_error = curl_error($ch);
    curl_close($ch);
    
    if ($token_error) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error de conexión: ' . $token_error]);
        exit;
    }
    
    $token_data = json_decode($token_resp, true);
    
    if (empty($token_data['access_token'])) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'No se pudo autenticar con PayPal. Verifica tus credenciales.']);
        exit;
    }
    
    $access_token = $token_data['access_token'];
    
    // 2. CREAR ORDEN
    $url = $api_url . '/v2/checkout/orders';
    
    $body = [
        'intent' => 'CAPTURE',
        'purchase_units' => [[
            'amount' => [
                'currency_code' => $currency,
                'value' => number_format($amount, 2, '.', '')
            ],
            'description' => $description
        ]],
        'application_context' => [
            'return_url' => home_url('/juguemos?payment=success'),
            'cancel_url' => home_url('/juguemos?payment=cancel')
        ]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $access_token,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $response = curl_exec($ch);
    $response_error = curl_error($ch);
    curl_close($ch);
    
    if ($response_error) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Error al crear orden: ' . $response_error]);
        exit;
    }
    
    $data = json_decode($response, true);
    
    if (isset($data['id'])) {
        foreach ($data['links'] as $link) {
            if ($link['rel'] === 'approve') {
                header('Content-Type: application/json');
                echo json_encode(['approve_url' => $link['href']]);
                exit;
            }
        }
    }
    
    // Si llegamos aquí, hay error
    $error_msg = $data['message'] ?? 'No se pudo crear la orden';
    header('Content-Type: application/json');
    echo json_encode(['error' => $error_msg]);
}

paypal_create_order($amount, $currency, $description);
