<?php
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Clase para manejar configuraciones de métodos de pago
 * Centraliza todas las opciones de pago almacenadas en la base de datos
 */
class Juguemos_Payment_Settings {
    
    /**
     * Obtiene las credenciales de PayPal
     * @return array
     */
    public static function get_paypal_credentials() {
        $client_id = get_option('juguemos_paypal_client_id', '');
        $secret = get_option('juguemos_paypal_secret', '');
        $mode = get_option('juguemos_paypal_mode', 'sandbox');
        
        return [
            'client_id' => $client_id,
            'secret' => $secret,
            'mode' => $mode,
            'is_configured' => !empty($client_id) && !empty($secret)
        ];
    }
    
    /**
     * Guarda las credenciales de PayPal
     * @param string $client_id
     * @param string $secret
     * @param string $mode
     * @return bool
     */
    public static function save_paypal_credentials($client_id, $secret, $mode = 'sandbox') {
        $updated = true;
        
        if (!update_option('juguemos_paypal_client_id', sanitize_text_field($client_id))) {
            $updated = false;
        }
        
        if (!update_option('juguemos_paypal_secret', sanitize_text_field($secret))) {
            $updated = false;
        }
        
        if (!update_option('juguemos_paypal_mode', sanitize_text_field($mode))) {
            $updated = false;
        }
        
        return $updated;
    }
    
    /**
     * Obtiene las credenciales de Stripe
     * @return array
     */
    public static function get_stripe_credentials() {
        return [
            'publishable_key' => get_option('juguemos_stripe_publishable_key', ''),
            'secret_key' => get_option('juguemos_stripe_secret_key', ''),
            'mode' => get_option('juguemos_stripe_mode', 'test'),
            'is_configured' => !empty(get_option('juguemos_stripe_publishable_key', '')) && 
                              !empty(get_option('juguemos_stripe_secret_key', ''))
        ];
    }
    
    /**
     * Obtiene el teléfono de WhatsApp
     * @return string
     */
    public static function get_whatsapp_phone() {
        return get_option('juguemos_whatsapp_phone', '');
    }
    
    /**
     * Obtiene el teléfono de Zelle
     * @return string
     */
    public static function get_zelle_phone() {
        return get_option('juguemos_zelle_phone', '');
    }
    
    /**
     * Verifica si Apple Pay está habilitado
     * @return bool
     */
    public static function is_apple_pay_enabled() {
        return get_option('juguemos_apple_pay_enabled', '') === '1';
    }
    
    /**
     * Obtiene todas las configuraciones de pago
     * @return array
     */
    public static function get_all_payment_settings() {
        return [
            'paypal' => self::get_paypal_credentials(),
            'stripe' => self::get_stripe_credentials(),
            'whatsapp' => self::get_whatsapp_phone(),
            'zelle' => self::get_zelle_phone(),
            'apple_pay_enabled' => self::is_apple_pay_enabled()
        ];
    }
}