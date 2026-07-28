<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- ==========================================
   MODAL DE PAGO
   ========================================== -->
<div class="j-payment-overlay" id="j-payment-overlay">
    <div class="j-payment-modal" id="j-payment-modal">
        <button class="j-payment-modal-close" id="j-payment-modal-close">&times;</button>
        
        <div class="j-payment-header">
            <h3>💳 Selecciona tu método de pago</h3>
            <p>Total a pagar: <strong id="j-payment-amount">$0.00</strong></p>
        </div>

        <hr>

        <div class="j-payment-body">
            <!-- Métodos de pago -->
            <div class="j-payment-methods">
                <!-- PayPal -->
                <button class="j-payment-method active" data-method="paypal">
                    <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" class="j-payment-icon">
                    <span>PayPal</span>
                </button>
                
                <!-- Apple Pay -->
                <button class="j-payment-method" data-method="apple-pay" disabled style="opacity:0.5;cursor:not-allowed;">
                    <img src="/wp-content/uploads/2026/07/apple-pay.png" alt="Apple Pay" class="j-payment-icon">
                    <span>Apple Pay</span>
                </button>
                
                <!-- Zelle -->
                <button class="j-payment-method" data-method="zelle" disabled style="opacity:0.5;cursor:not-allowed;">
                    <img src="/wp-content/uploads/2026/07/zelle.png" alt="Zelle" class="j-payment-icon">
                    <span>Zelle</span>
                </button>
            </div>

            <!-- Detalles del pago -->
            <div id="j-payment-details" class="j-payment-details">
                <div class="j-payment-info">
                    <p>🔒 Pago seguro a través de PayPal</p>
                    <p class="j-payment-sub">Serás redirigido a PayPal para completar el pago.</p>
                </div>
                <button id="j-process-payment" class="j-btn-next" style="width:100%;">
                    <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;">
                    Pagar con PayPal
                </button>
            </div>

            <!-- Estado de carga -->
            <div id="j-payment-loading" style="display:none;text-align:center;padding:20px;">
                <div class="j-spinner"></div>
                <p>Redirigiendo a PayPal...</p>
                <p style="font-size:12px;color:#999;">Por favor espera un momento</p>
            </div>

            <!-- Redes sociales (footer) -->
            <div class="j-payment-social">
                <p style="font-size:12px;color:#999;margin:15px 0 0 0;">Síguenos en redes sociales</p>
                <div class="j-social-icons">
                    <img src="/wp-content/uploads/2026/07/social.png" alt="Redes Sociales" style="height:30px;opacity:0.7;">
                </div>
            </div>
        </div>
    </div>
</div>