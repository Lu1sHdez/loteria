<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<section id="juguemos-payment" class="j-step">

    <div class="titulo-seccion-contenedor">
        <h2 class="titulo-seccion">PAGO Y DESCARGA</h2>
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
                        <span>País</span>
                        <strong id="payment-summary-country">-</strong>
                    </div>
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
                        <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" class="j-payment-icon">
                        <span>PayPal</span>
                    </button>
                    <button class="j-payment-method" data-method="apple-pay" disabled>
                        <img src="/wp-content/uploads/2026/07/apple-pay.png" alt="Apple Pay" class="j-payment-icon">
                        <span>Apple Pay</span>
                    </button>
                    <button class="j-payment-method" data-method="zelle" disabled>
                        <img src="/wp-content/uploads/2026/07/zelle.png" alt="Zelle" class="j-payment-icon">
                        <span>Zelle</span>
                    </button>
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