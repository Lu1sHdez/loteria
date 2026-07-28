(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.init();
        }
        
        init() {
            this.bindEvents();
            setTimeout(() => {
                this.updatePaymentSummary();
                this.checkPaymentStatus();
            }, 300);
        }
        
        bindEvents() {
            // Seleccionar método de pago
            $(document).on('click', '.j-payment-method', (e) => {
                const method = $(e.currentTarget).data('method');
                this.selectMethod(method);
            });
            
            // Procesar pago
            $(document).on('click', '#j-process-payment', () => {
                this.processPayment();
            });
        }
        
        updatePaymentSummary() {
            const total = JuguemosState.total || 0;
            const currency = JuguemosState.currency || 'USD';
            const country = JuguemosState.country || 'Mexico';
            const mode = JuguemosState.mode || 'sencilla';
            const quantity = JuguemosState.quantity || 1;
        
            const countryEl = document.getElementById('payment-summary-country');
            if (countryEl) countryEl.textContent = country;
        
            const modeEl = document.getElementById('payment-summary-mode');
            if (modeEl) modeEl.textContent = mode === 'favoritas' ? '7 Favoritas' : mode;
        
            const quantityEl = document.getElementById('payment-summary-quantity');
            if (quantityEl) quantityEl.textContent = quantity;
        
            const priceEl = document.getElementById('payment-summary-price');
            if (priceEl) priceEl.textContent = `$${Number(total).toFixed(2)} ${currency}`;
        }
        
        selectMethod(method) {
            $('.j-payment-method').removeClass('active');
            $(`.j-payment-method[data-method="${method}"]`).addClass('active');
            
            if (method === 'paypal') {
                $('#j-process-payment').html(`
                    <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:24px;vertical-align:middle;margin-right:10px;">
                    Pagar con PayPal
                `);
            }
        }
        
        processPayment() {
            const btn = $('#j-process-payment');
            btn.prop('disabled', true);
            btn.hide();
            $('#j-payment-loading').show();
            
            const amount = JuguemosState.total || 1.00;
            const currency = JuguemosState.currency || 'USD';
            
            console.log('💰 Pagando:', amount, currency);
            
            fetch('/wp-content/plugins/juguemos/public/templates/payment/paypal-simple.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    description: 'Lotería La Dama - Pedido'
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('✅ Respuesta PayPal:', data);
                
                if (data.approve_url) {
                    // ✅ ABRIR PAYPAL EN NUEVA VENTANA
                    window.open(data.approve_url, '_blank', 'width=800,height=600');
                    
                    // ✅ MOSTRAR MENSAJE DE ESPERA
                    this.showWaitingMessage();
                    
                    // ✅ INICIAR VERIFICACIÓN DE PAGO
                    this.startPaymentVerification();
                    
                } else {
                    alert('❌ Error: ' + (data.error || 'No se pudo crear la orden'));
                    btn.prop('disabled', false);
                    btn.show();
                    $('#j-payment-loading').hide();
                }
            })
            .catch(error => {
                console.error('❌ Error:', error);
                alert('Error de conexión. Intenta nuevamente.');
                btn.prop('disabled', false);
                btn.show();
                $('#j-payment-loading').hide();
            });
        }
        
        showWaitingMessage() {
            // Ocultar botón de pago
            $('#j-process-payment').hide();
            $('#j-payment-loading').hide();
            $('.j-payment-methods').hide();
            
            // Mostrar mensaje de espera
            if (!$('#j-waiting-message').length) {
                $('#juguemos-payment .j-section:last').before(`
                    <div id="j-waiting-message" class="j-section" style="text-align:center;padding:30px;">
                        <div class="j-spinner"></div>
                        <h3 style="color:#1E2249;">⏳ Esperando confirmación de pago...</h3>
                        <p style="color:#666;">Has sido redirigido a PayPal para completar el pago.</p>
                        <p style="font-size:14px;color:#999;">La página se actualizará automáticamente cuando el pago sea confirmado.</p>
                        <button id="j-check-payment-status" class="j-btn-back" style="margin-top:15px;">
                            🔄 Verificar estado ahora
                        </button>
                        <p style="font-size:12px;color:#999;margin-top:10px;">
                            Si ya pagaste, haz clic en "Verificar estado ahora"
                        </p>
                    </div>
                `);
                
                // Evento para verificar manualmente
                $(document).on('click', '#j-check-payment-status', () => {
                    this.checkPaymentManually();
                });
            }
        }
        
        // ✅ NUEVO: Verificar pago manualmente SIN RECARGAR
        checkPaymentManually() {
            console.log('🔍 Verificando pago manualmente...');
            
            // Verificar en sessionStorage
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                console.log('✅ Pago confirmado!');
                this.paymentSuccess();
                return;
            }
            
            // Si no está en sessionStorage, verificar con el servidor
            $.ajax({
                url: Juguemos.ajax_url,
                method: 'POST',
                data: {
                    action: 'juguemos_verify_payment',
                    nonce: Juguemos.nonce,
                    token: sessionStorage.getItem('juguemos_payment_token') || ''
                },
                success: (response) => {
                    console.log('✅ Respuesta del servidor:', response);
                    if (response.success && response.data && response.data.paid) {
                        sessionStorage.setItem('juguemos_payment_verified', 'true');
                        this.paymentSuccess();
                    } else {
                        alert('⏳ Aún no se ha confirmado tu pago. Por favor espera unos segundos.');
                    }
                },
                error: () => {
                    alert('❌ Error al verificar el pago. Intenta nuevamente.');
                }
            });
        }
        
        startPaymentVerification() {
            let attempts = 0;
            const maxAttempts = 30; // 30 intentos (2.5 minutos)
            
            const checkPayment = setInterval(() => {
                attempts++;
                console.log('🔍 Verificando pago... Intento ' + attempts);
                
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    clearInterval(checkPayment);
                    console.log('✅ Pago confirmado!');
                    this.paymentSuccess();
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkPayment);
                    console.log('⏰ Tiempo de espera agotado.');
                    // Mostrar mensaje de tiempo agotado
                    $('#j-waiting-message p:last').before(`
                        <p style="color:#e74c3c;font-weight:bold;">
                            ⏰ El tiempo de espera ha terminado.
                        </p>
                        <p style="font-size:12px;color:#999;">
                            Si ya realizaste el pago, haz clic en "Verificar estado ahora".
                        </p>
                    `);
                }
            }, 5000); // Cada 5 segundos
        }
        
        paymentSuccess() {
            // Ocultar todo
            $('.j-payment-methods').hide();
            $('#j-process-payment').hide();
            $('#j-payment-loading').hide();
            $('#j-waiting-message').remove();
            
            // ✅ Mostrar sección de descarga
            $('#j-download-section').show();
            
            // ✅ Actualizar el botón de descarga
            const btnDownload = document.getElementById('j-download-pdf');
            if (btnDownload) {
                btnDownload.textContent = '📄 Descargar PDF';
                btnDownload.style.background = '#24B8C8';
                btnDownload.style.display = 'inline-block';
            }
            
            // ✅ Mostrar mensaje de éxito
            $('#j-download-section h3').text('🎉 ¡Pago confirmado!');
            
            // ✅ Guardar en sessionStorage para futuras visitas
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            
            // ✅ Generar PDF automáticamente después de 2 segundos (opcional)
            setTimeout(() => {
                if (typeof JuguemosPDF !== 'undefined') {
                    JuguemosPDF.generate();
                }
            }, 2000);
        }
    }
    
    $(document).ready(() => {
        window.JuguemosPaymentInstance = new JuguemosPayment();
    });
    
})(jQuery);