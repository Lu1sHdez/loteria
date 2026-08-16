<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<section id="juguemos-payment" class="j-step">
    <div class="j-step-header">
        <div class="titulo-seccion-contenedor">
            <img
                class="destello"
                src="/wp-content/uploads/2026/07/Destello1.png"
                alt="">

            <h2 class="titulo-seccion">
                PAGO Y DESCARGA
            </h2>

            <img
                class="destello"
                src="/wp-content/uploads/2026/07/Destello2.png"
                alt="">
        </div>
    </div>

    <div class="j-step-body">
        <div class="juguemos-left">

            <!-- ==========================================
            RESUMEN DEL PEDIDO
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
            MÉTODOS DE PAGO
            ========================================== -->
            <div class="j-section">
                <div class="j-panel-item">
                    <div class="subtitulo-aqua">2. Selecciona tu método de pago</div>
                </div>

                <div class="j-payment-methods">
                    <button class="j-payment-method active" data-method="paypal">
                        <img src="/wp-content/uploads/2026/08/paypal-scaled.png" alt="PayPal" class="j-payment-icon">
                       
                    </button>

                    <?php 
                        $stripe_creds = Juguemos_Payment_Settings::get_stripe_credentials();
                        if ($stripe_creds['is_configured']): 
                        ?>
                        <button class="j-payment-method" data-method="stripe">
                            <img src="/wp-content/uploads/2026/08/strupe.webp" alt="Stripe" class="j-payment-icon">
                            
                        </button>
                        <?php endif;
                    ?>

                </div>

                <div class="j-payment-actions">
                    <button id="j-process-payment" class="j-btn-next">
                        <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;">
                        Pagar con PayPal
                    </button>
                </div>

                <div id="j-payment-loading" style="display:none;text-align:center;padding:20px;">
                    <div class="j-spinner"></div>
                    <p class="j-texto-normal">Redirigiendo a PayPal...</p>
                </div>
            </div>

            <!-- ==========================================
            SECCIÓN DE DESCARGA (se muestra después de pagar)
            ========================================== -->
            <div id="j-download-section" style="display:none; text-align:center; padding:30px; background:#f0f9fa; border-radius:12px; margin-top:20px;">
                <p class="text-aqua-normal">¡Pago confirmado!</p>
                <p class="j-texto-normal">Tu pago ha sido procesado exitosamente. Ahora puedes descargar tu PDF.</p>
                <button id="j-download-pdf" class="j-btn-download">
                    <span id="j-download-text">Descargar PDF</span>
                    <span id="j-download-spinner" style="display:none; width:18px; height:18px; border:2px solid #fff; border-top-color: transparent; border-radius:50%; animation: spin 0.8s linear infinite;"></span>
                </button>
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
