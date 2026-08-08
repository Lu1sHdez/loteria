<?php
if (!defined('ABSPATH')) exit;

class Juguemos_Stripe_Handler {
    
    private $secret_key;
    private $publishable_key;
    private $mode;
    
    public function __construct() {
        $creds = Juguemos_Payment_Settings::get_stripe_credentials();
        
        $this->secret_key = $creds['secret_key'];
        $this->publishable_key = $creds['publishable_key'];
        $this->mode = $creds['mode'];
    }
    
    /**
     * Obtiene la URL base de la API de Stripe
     */
    private function get_api_url() {
        return $this->mode === 'live' 
            ? 'https://api.stripe.com/v1'
            : 'https://api.stripe.com/v1';
    }
    
    /**
     * Crea una sesión de checkout en Stripe
     */
    public function create_checkout_session($amount, $currency, $order_id) {
        if (empty($this->secret_key) || empty($this->publishable_key)) {
            return ['error' => 'Stripe no configurado correctamente'];
        }
        
        $currency = strtolower($currency);
        $amount_cents = intval(round($amount * 100));
        
        if ($amount_cents < 50) {
            return ['error' => 'El monto mínimo es $0.50 USD o su equivalente'];
        }
        
        // URLs de retorno
        $success_url = home_url('/juguemos?payment=stripe_success&session_id={CHECKOUT_SESSION_ID}&order_id=' . $order_id);
        $cancel_url = home_url('/juguemos?payment=stripe_cancel');
        
        $payload = [
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => $currency,
                    'product_data' => [
                        'name' => 'Lotería La Dama',
                        'description' => 'Pedido #' . $order_id,
                    ],
                    'unit_amount' => $amount_cents,
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => $success_url,
            'cancel_url' => $cancel_url,
            'metadata' => [
                'order_id' => $order_id,
                'plugin' => 'juguemos'
            ],
        ];
        
        $response = wp_remote_post($this->get_api_url() . '/checkout/sessions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->secret_key,
                'Content-Type' => 'application/x-www-form-urlencoded',
            ],
            'body' => http_build_query($payload),
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            error_log('Stripe Error: ' . $response->get_error_message());
            return ['error' => 'Error de conexión con Stripe'];
        }
        
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if (isset($body['id'])) {
            return [
                'success' => true,
                'session_id' => $body['id'],
                'url' => $body['url'],
                'publishable_key' => $this->publishable_key,
            ];
        }
        
        error_log('Stripe Response Error: ' . print_r($body, true));
        return ['error' => $body['error']['message'] ?? 'Error al crear sesión de pago'];
    }
    
    /**
     * Obtiene el estado de una sesión
     */
    public function get_session_status($session_id) {
        if (empty($this->secret_key)) {
            return false;
        }
        
        $response = wp_remote_get($this->get_api_url() . '/checkout/sessions/' . $session_id, [
            'headers' => [
                'Authorization' => 'Bearer ' . $this->secret_key,
            ],
            'timeout' => 30,
        ]);
        
        if (is_wp_error($response)) {
            error_log('Stripe Status Error: ' . $response->get_error_message());
            return false;
        }
        
        return json_decode(wp_remote_retrieve_body($response), true);
    }
    
    /**
     * Verifica si un pago fue completado
     */
    public function is_payment_completed($session_id) {
        $session = $this->get_session_status($session_id);
        
        if (!$session) {
            return false;
        }
        
        // Stripe usa 'payment_status' en la sesión
        return isset($session['payment_status']) && $session['payment_status'] === 'paid';
    }
}
