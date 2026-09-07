<?php
if (!defined('ABSPATH')) {
    exit;
}

/* $is_admin = false;
if (is_user_logged_in() && current_user_can('manage_options')) {
    $is_admin = true;
}  */

$is_admin = false; 
?>

<section id="juguemos-payment" class="j-step">
    <div class="j-step-header">
        <div class="titulo-seccion-contenedor">
            <img class="destello" src="/wp-content/uploads/2026/07/Destello1.png" alt="">
            <h2 class="titulo-seccion">PAGAR Y DESCARGAR</h2>
            <img class="destello" src="/wp-content/uploads/2026/07/Destello2.png" alt="">
        </div>
    </div>

    <div class="j-step-body">   
        <div class="juguemos-left">

            <!-- ==========================================
            SECCIÓN 1: RESUMEN DEL PEDIDO
            ========================================== -->
            <div class="j-section">
                <div class="j-panel-item">
                    <div class="subtitulo-aqua">1. Resumen de tu pedido</div>
                </div>

                <div class="j-order-summary">
                    <div class="summary-row">
                        <span>Tipo</span>
                        <strong id="payment-summary-mode">-</strong>
                    </div>
                    <div class="summary-row">
                        <span>Tablas</span>
                        <strong id="payment-summary-quantity">0</strong>
                    </div>
                    <hr>
                    <div class="summary-total">
                        <span>Total</span>
                        <strong id="payment-summary-price">$0.00</strong>
                    </div>
                </div>
            </div>

            <!-- ==========================================
            SECCIÓN 2: MÉTODOS DE PAGO
            ========================================== -->
            <div class="j-section">
                <div class="j-panel-item">
                    <div class="subtitulo-aqua">2. Selecciona tu método de pago</div>
                </div>

                <div class="j-payment-methods-grid" id="j-payment-methods-grid">
                    <?php 
                        $stripe_creds = Juguemos_Payment_Settings::get_stripe_credentials();
                        if ($stripe_creds['is_configured']): 
                    ?>
                    <button class="j-payment-method j-payment-method-with-label active" data-method="stripe_card">
                        <img src="/wp-content/uploads/2026/08/credit-card.png" alt="Tarjeta" class="j-payment-icon">
                        <span class="j-payment-label">Tarjetas crédito y débito</span>
                    </button>
                    <button class="j-payment-method" data-method="paypal">
                        <img src="/wp-content/uploads/2026/08/paypal-scaled.png" alt="PayPal" class="j-payment-icon paypal">
                    </button>
                    <button class="j-payment-method" data-method="stripe_googlepay">
                        <img src="/wp-content/uploads/2026/08/google-pay.webp" alt="Google Pay" class="j-payment-icon">
                    </button>
                    <button class="j-payment-method" data-method="stripe_applepay">
                        <img src="/wp-content/uploads/2026/08/Apple-pay.png" alt="Apple Pay" class="j-payment-icon">
                    </button>
                    <?php endif; ?>
                </div>

                <!-- MENSAJE DE ADVERTENCIA -->
                <div id="j-minimum-amount-warning" style="display:none;text-align:center;margin-bottom:12px;padding:10px 16px;border-radius:8px;font-size:14px;font-weight:600;color:#FA299C;background:transparent;font-style:italic;">
                    <span id="j-min-amount-text-wrapper">
                        ⚠️ <span id="j-min-amount-label">El monto mínimo para pagar con tarjeta es de</span> <strong id="j-min-amount-text">$10.00 MXN</strong>.
                    </span>
                    <br>
                    <span id="j-min-amount-action" style="font-size:12px;font-weight:400;font-style:italic;">Agrega más tablas o usa PayPal.</span>
                </div>

                <div class="j-payment-actions">
                    <button id="j-process-payment" class="j-btn-next">
                        Pagar con Tarjeta
                    </button>
                </div>

                <div id="j-payment-loading" style="display:none;text-align:center;padding:20px;">
                    <div class="j-spinner"></div>
                    <p class="j-texto-normal">Redirigiendo a PayPal...</p>
                </div>
            </div>

            <!-- ==========================================
            SECCIÓN 3: DESCARGA (SEPARADA)
            ========================================== -->
            <div class="j-section" id="j-download-section-wrapper">
                <div id="j-download-section" 
                    style="<?php echo $is_admin ? 'display:flex;' : 'display:none;'; ?> flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:30px; background:#f0f9fa; border-radius:12px;"
                    data-admin="<?php echo $is_admin ? 'true' : 'false'; ?>">
                    
                    <p class="text-aqua-normal" style="margin-bottom:8px;"><?php echo $is_admin ? 'Descarga disponible' : '¡Pago confirmado!'; ?></p>
                    <p class="j-texto-normal" style="max-width:600px; margin:0 auto 15px auto;">
                        <?php echo $is_admin ? 'Como administrador, puedes descargar el PDF sin realizar el pago.' : 'Tu pago ha sido procesado exitosamente. Ahora puedes descargar tu PDF.'; ?>
                    </p>

                    <!-- 🔥 BARRA DE PROGRESO -->
                    <div id="j-pdf-progress" style="display:none; margin-top:15px; width:100%; max-width:450px; margin-left:auto; margin-right:auto;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:15px; color:#1E2249; font-family:'Cairo',sans-serif; font-weight:700;">Descargando PDF...</span>
                            <span style="font-size:15px; color:#1E2249; font-family:'Cairo',sans-serif; font-weight:700;" id="j-pdf-progress-count">0/0</span>
                        </div>
                        <div style="width:100%; height:16px; background:#E5E5E5; border-radius:4px; overflow:hidden;">
                            <div id="j-pdf-progress-bar" style="width:0%; height:100%; background: #24B8C8; border-radius:4px; transition:width 0.3s ease;"></div>
                        </div>
                        <div style="text-align:center; margin-top:6px;">
                            <span style="font-size:12px; color:#999; font-family:'Cairo',sans-serif;" id="j-pdf-status">Preparando...</span>
                        </div>
                    </div>
                    
                    <button id="j-download-pdf" class="j-btn-download" style="margin:15px auto 0;">
                        <span id="j-download-text">Descargar PDF <?php echo $is_admin ? '(Admin)' : ''; ?></span>
                        <span id="j-download-spinner" style="display:none; width:18px; height:18px; border:2px solid #fff; border-top-color: transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span>
                    </button>
                </div>
            </div>

            <!-- ==========================================
            BOTÓN REGRESAR
            ========================================== -->
            <div class="j-preview-header">
                <button type="button" id="j-back-to-preview" class="j-btn-back">
                    <span>←</span>
                    <span>Regresar</span>
                </button>
            </div>

        </div>
    </div>

    
</section>
