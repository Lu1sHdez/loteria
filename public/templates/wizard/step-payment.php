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
        <div class="juguemos-left" style="width:100%;">

            <!-- ==========================================
            RESUMEN DEL PEDIDO
            ========================================== -->
            <!-- ==========================================
            RESUMEN DEL PEDIDO (usando los mismos IDs que funcionan)
            ========================================== -->
            <div class="j-section">
                <div class="j-panel-item">
                    <div class="subtitulo-aqua">Resumen de tu pedido</div>
                </div>

                <div class="j-order-summary" style="max-width:400px;margin:0 auto;">
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
                    <div class="subtitulo-aqua">Selecciona tu método de pago</div>
                </div>

                <div class="j-payment-methods" style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;margin:20px 0;">
                    <!-- PayPal -->
                    <button class="j-payment-method active" data-method="paypal" style="padding:15px 30px;border:2px solid #24B8C8;border-radius:10px;background:#f0f9fa;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:120px;">
                        <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:40px;">
                        <span style="font-weight:600;">PayPal</span>
                    </button>
                    
                    <!-- Apple Pay -->
                    <button class="j-payment-method" data-method="apple-pay" disabled style="padding:15px 30px;border:2px solid #e0e0e0;border-radius:10px;background:white;cursor:not-allowed;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:120px;opacity:0.5;">
                        <img src="/wp-content/uploads/2026/07/apple-pay.png" alt="Apple Pay" style="height:40px;">
                        <span style="font-weight:600;">Apple Pay</span>
                    </button>
                    
                    <!-- Zelle -->
                    <button class="j-payment-method" data-method="zelle" disabled style="padding:15px 30px;border:2px solid #e0e0e0;border-radius:10px;background:white;cursor:not-allowed;display:flex;flex-direction:column;align-items:center;gap:8px;min-width:120px;opacity:0.5;">
                        <img src="/wp-content/uploads/2026/07/zelle.png" alt="Zelle" style="height:40px;">
                        <span style="font-weight:600;">Zelle</span>
                    </button>
                </div>

                <!-- Botón de pago -->
                <div style="text-align:center;margin-top:20px;">
                    <button id="j-process-payment" class="j-btn-next" style="margin:0 auto;padding:15px 40px;">
                        <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:24px;vertical-align:middle;margin-right:10px;">
                        Pagar con PayPal
                    </button>
                </div>

                <!-- Estado de carga -->
                <div id="j-payment-loading" style="display:none;text-align:center;padding:20px;">
                    <div class="j-spinner"></div>
                    <p>Redirigiendo a PayPal...</p>
                    <p style="font-size:12px;color:#999;">Por favor espera un momento</p>
                </div>
            </div>

            <!-- ==========================================
            BOTÓN DESCARGAR PDF (se muestra después de pagar)
            ========================================== -->
            <div id="j-download-section" style="display:none;text-align:center;padding:30px;background:#f0f9fa;border-radius:12px;margin-top:20px;">
                <div style="font-size:48px;margin-bottom:15px;">🎉</div>
                <h3 style="color:#1E2249;margin:0 0 10px 0;">¡Pago confirmado!</h3>
                <p style="color:#666;margin-bottom:20px;">Tu pago ha sido procesado exitosamente. Ahora puedes descargar tu PDF.</p>
                <button id="j-download-pdf" class="j-btn-next" style="margin:0 auto;background:#24B8C8;">
                    📄 Descargar PDF
                </button>
            </div>

            <!-- ==========================================
            BOTÓN REGRESAR
            ========================================== -->
            <div class="j-preview-header" style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;">
                <button type="button" id="j-back-to-preview" class="j-btn-back">
                    <span>←</span>
                    <span>Regresar</span>
                </button>
            </div>

        </div>
    </div>

</section>

<style>
.j-payment-method.active {
    border-color: #24B8C8 !important;
    background: #f0f9fa !important;
}
.j-payment-method:hover:not(:disabled) {
    border-color: #24B8C8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.j-spinner {
    display: inline-block;
    width: 30px;
    height: 30px;
    border: 4px solid #e0e0e0;
    border-top: 4px solid #FA299C;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 10px;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>