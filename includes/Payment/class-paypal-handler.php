<?php
if (!defined('ABSPATH')) exit;

class Juguemos_PayPal_Handler {
    
    private $client_id;
    private $secret;
    private $mode;
    
    public function __construct() {
        $creds = Juguemos_Payment_Settings::get_paypal_credentials();
        
        $this->client_id = $creds['client_id'];
        $this->secret = $creds['secret'];
        $this->mode = $creds['mode'];
    }
    
    private function get_access_token() {
        $response = wp_remote_post(
            $this->get_api_url() . '/v1/oauth2/token',
            [
                'headers' => [
                    'Authorization' => 'Basic ' . base64_encode($this->client_id . ':' . $this->secret),
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/x-www-form-urlencoded'
                ],
                'body' => [
                    'grant_type' => 'client_credentials'
                ],
                'timeout' => 30
            ]
        );

        if (is_wp_error($response)) {
            error_log('PayPal OAuth Error: ' . $response->get_error_message());
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (empty($data['access_token'])) {
            error_log('PayPal OAuth Response: ' . print_r($data, true));
            return false;
        }

        return $data['access_token'];
    }

    public function create_order($amount, $currency, $order_id) {
        $access_token = $this->get_access_token();
        if (!$access_token) {
            error_log('No se pudo obtener el Access Token de PayPal.');
            return false;
        }

        $url = $this->get_api_url() . '/v2/checkout/orders';
        
        $body = [
            'intent' => 'CAPTURE',
            'purchase_units' => [
                [
                    'reference_id' => 'ORDER_' . $order_id,
                    'amount' => [
                        'currency_code' => $currency,
                        'value' => number_format($amount, 2, '.', '')
                    ],
                    'description' => 'Lotería La Dama - Pedido #' . $order_id,
                    'custom_id' => $order_id
                ]
            ],
            'application_context' => [
                'return_url' => home_url('/juguemos?payment=success&order_id=' . $order_id),
                'cancel_url' => home_url('/juguemos?payment=cancel')
            ]
        ];

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json'
            ],
            'body' => wp_json_encode($body),
            'timeout' => 30
        ]);

        if (is_wp_error($response)) {
            error_log('PayPal Error: ' . $response->get_error_message());
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        if (isset($data['id'])) {
            foreach ($data['links'] as $link) {
                if ($link['rel'] === 'approve') {
                    return $link['href'];
                }
            }
        }

        error_log('PayPal Create Order Error: ' . print_r($data, true));
        return false;
    }

    public function capture_order($paypal_order_id) {
        $access_token = $this->get_access_token();
        if (!$access_token) {
            error_log('No se pudo obtener el Access Token de PayPal.');
            return false;
        }

        $url = $this->get_api_url() . '/v2/checkout/orders/' . $paypal_order_id . '/capture';

        $response = wp_remote_post($url, [
            'headers' => [
                'Authorization' => 'Bearer ' . $access_token,
                'Content-Type' => 'application/json'
            ],
            'timeout' => 30
        ]);

        if (is_wp_error($response)) {
            error_log('PayPal Capture Error: ' . $response->get_error_message());
            return false;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);

        // ✅ Verificar si la orden fue capturada correctamente
        if (isset($data['status']) && in_array($data['status'], ['COMPLETED', 'APPROVED'])) {
            return $data;
        }

        // ✅ Si el status es 'PAYER_ACTION_REQUIRED', el usuario ya pagó
        if (isset($data['status']) && $data['status'] === 'PAYER_ACTION_REQUIRED') {
            error_log('PayPal: Pago pendiente de confirmación - ' . $paypal_order_id);
            return ['status' => 'PENDING', 'message' => 'Pago pendiente de confirmación'];
        }

        error_log('PayPal Capture Response: ' . print_r($data, true));
        return false;
    }

    private function get_api_url() {
        return $this->mode === 'live' 
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com';
    }
}
