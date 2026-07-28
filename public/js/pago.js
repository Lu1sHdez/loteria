(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.init();
        }
        
        init() {
            this.bindEvents();
        }
        
        bindEvents() {
            // Cerrar modal
            $(document).on('click', '.j-payment-modal-close, .j-payment-overlay', (e) => {
                if (e.target === e.currentTarget || $(e.target).hasClass('j-payment-modal-close')) {
                    this.closeModal();
                }
            });
            
            // Seleccionar método de pago
            $(document).on('click', '.j-payment-method', (e) => {
                const method = $(e.currentTarget).data('method');
                this.selectMethod(method);
            });
            
            // Procesar pago
            $(document).on('click', '#j-process-payment', () => {
                this.processPayment();
            });
            
            // Cerrar con ESC
            $(document).on('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        }
        
        showPaymentModal() {
            const total = JuguemosState.total || 0;
            const currency = JuguemosState.currency || 'USD';
            
            $('#j-payment-amount').text(`$${Number(total).toFixed(2)} ${currency}`);
            
            $('#j-payment-overlay').addClass('active');
            $('#j-payment-modal').addClass('active');
            
            $('#j-payment-details').show();
            $('#j-payment-loading').hide();
            $('#j-process-payment').prop('disabled', false).html(`
                <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;">
                Pagar con PayPal
            `);
        }
        
        closeModal() {
            $('#j-payment-overlay').removeClass('active');
            $('#j-payment-modal').removeClass('active');
            $('#j-payment-loading').hide();
            $('#j-payment-details').show();
            $('#j-process-payment').prop('disabled', false);
        }
        
        selectMethod(method) {
            $('.j-payment-method').removeClass('active');
            $(`.j-payment-method[data-method="${method}"]`).addClass('active');
            
            if (method === 'paypal') {
                $('#j-payment-details').show();
                $('#j-process-payment').html(`
                    <img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;">
                    Pagar con PayPal
                `);
            }
        }
        
        processPayment() {
            const btn = $('#j-process-payment');
            btn.prop('disabled', true);
            $('#j-payment-details').hide();
            $('#j-payment-loading').show();
            
            const amount = JuguemosState.total || 1.00;
            const currency = JuguemosState.currency || 'USD';
            
            console.log('💰 Pagando:', amount, currency);
            
            // LLAMAR AL ENDPOINT DE PAYPAL
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
                    const paypalWindow = window.open(data.approve_url, '_blank', 'width=800,height=600');
                    
                    // ✅ CERRAR MODAL Y MOSTRAR MENSAJE DE ESPERA
                    this.closeModal();
                    
                    // ✅ MOSTRAR MENSAJE DE ESPERA EN LA PÁGINA PRINCIPAL
                    this.showWaitingMessage();
                    
                    // ✅ INICIAR VERIFICACIÓN DE PAGO
                    this.startPaymentVerification();
                    
                } else {
                    alert('❌ Error: ' + (data.error || 'No se pudo crear la orden'));
                    this.closeModal();
                }
            })
            .catch(error => {
                console.error('❌ Error:', error);
                alert('Error de conexión. Intenta nuevamente.');
                this.closeModal();
            });
        }
        
        // ✅ NUEVO: Marcar pago como verificado
        paymentSuccess(downloadUrl = null) {
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            sessionStorage.setItem('juguemos_payment_token', 'paypal_' + Date.now());
            
            this.closeModal();
            
            alert('🎉 ¡Pago confirmado! Ahora puedes descargar tu PDF.');
            
            if (typeof JuguemosPDF !== 'undefined') {
                setTimeout(() => {
                    JuguemosPDF.generate();
                }, 500);
            }
        }

        // Mostrar mensaje de espera después de abrir PayPal
        showWaitingMessage() {
            // Crear overlay de espera si no existe
            if (!document.getElementById('j-waiting-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'j-waiting-overlay';
                overlay.innerHTML = `
                    <div class="j-waiting-container">
                        <div class="j-spinner"></div>
                        <h2>⏳ Esperando confirmación de pago...</h2>
                        <p>Has sido redirigido a PayPal para completar el pago.</p>
                        <p style="font-size:14px;color:#999;">La página se actualizará automáticamente cuando el pago sea confirmado.</p>
                        <button onclick="window.location.reload()" class="j-btn-next" style="margin-top:15px;">
                            🔄 Verificar estado ahora
                        </button>
                        <p style="font-size:12px;color:#999;margin-top:15px;">
                            ¿Ya pagaste? Haz clic en "Verificar estado ahora" para descargar tu PDF.
                        </p>
                    </div>
                `;
                document.body.appendChild(overlay);
                
                // Estilos del overlay
                const style = document.createElement('style');
                style.textContent = `
                    #j-waiting-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        z-index: 999999;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .j-waiting-container {
                        background: white;
                        padding: 40px;
                        border-radius: 16px;
                        text-align: center;
                        max-width: 450px;
                        width: 90%;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    }
                    .j-waiting-container .j-spinner {
                        display: inline-block;
                        width: 40px;
                        height: 40px;
                        border: 4px solid #e0e0e0;
                        border-top: 4px solid #FA299C;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                        margin-bottom: 15px;
                    }
                    .j-waiting-container h2 {
                        color: #1E2249;
                        margin: 0 0 10px 0;
                    }
                    .j-waiting-container p {
                        color: #666;
                        margin: 5px 0;
                    }
                    #j-waiting-overlay .j-btn-next {
                        background: #24B8C8;
                        color: white;
                        border: none;
                        padding: 12px 30px;
                        border-radius: 8px;
                        font-size: 14px;
                        font-weight: 700;
                        cursor: pointer;
                        transition: background 0.3s ease;
                    }
                    #j-waiting-overlay .j-btn-next:hover {
                        background: #1d9ba8;
                    }
                `;
                document.head.appendChild(style);
            }
        }

        // Iniciar verificación de pago (polling)
        startPaymentVerification() {
            let attempts = 0;
            const maxAttempts = 60; // 60 intentos (5 minutos si es cada 5 segundos)
            
            const checkPayment = setInterval(() => {
                attempts++;
                console.log('🔍 Verificando pago... Intento ' + attempts);
                
                // Verificar si el pago fue confirmado en sessionStorage
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    clearInterval(checkPayment);
                    console.log('✅ Pago confirmado!');
                    this.hideWaitingMessage();
                    
                    // ✅ Generar PDF automáticamente
                    if (typeof JuguemosPDF !== 'undefined') {
                        setTimeout(() => {
                            JuguemosPDF.generate();
                        }, 500);
                    }
                    
                    // Limpiar estado de pago para futuras descargas
                    // sessionStorage.removeItem('juguemos_payment_verified');
                    // sessionStorage.removeItem('juguemos_payment_token');
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkPayment);
                    console.log('⏰ Tiempo de espera agotado. El usuario debe verificar manualmente.');
                    // Mostrar mensaje de tiempo agotado
                    const waitingMsg = document.querySelector('#j-waiting-overlay .j-waiting-container p:last-child');
                    if (waitingMsg) {
                        waitingMsg.innerHTML = '⏰ El tiempo de espera ha terminado. Si ya pagaste, haz clic en "Verificar estado ahora".';
                    }
                }
            }, 5000); // Verificar cada 5 segundos
        }

        // Ocultar mensaje de espera
        hideWaitingMessage() {
            const overlay = document.getElementById('j-waiting-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
    
    $(document).ready(() => {
        window.JuguemosPaymentInstance = new JuguemosPayment();
    });
    
})(jQuery);