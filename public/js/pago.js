(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.isDownloading = false;
            this.currentMethod = 'paypal';
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
            $(document).on('click', '.j-payment-method', (e) => {
                const method = $(e.currentTarget).data('method');
                this.selectMethod(method);
            });
            
            $(document).on('click', '#j-process-payment', () => {
                this.processPayment();
            });
        }
        
        updatePaymentSummary() {
            const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            const subtotal = (JuguemosState.unitPrice || 0) * totalTablas;
            
            const isUSA = JuguemosState.country === 'USA';
            const precioBarajas = isUSA 
                ? (JuguemosState.precioBarajasUSA || 15.00) 
                : (JuguemosState.precioBarajasMexico || 50.00);
            const costoBarajas = JuguemosState.barajasIncluidas ? precioBarajas : 0;
            
            const totalFinal = subtotal + costoBarajas;
            const priceText = '$' + Number(totalFinal).toFixed(2) + ' ' + JuguemosState.currency;
            
            document.getElementById('payment-summary-mode').textContent = 
                JuguemosState.mode === 'sencilla' ? 'Sencilla' :
                JuguemosState.mode === 'dobles' ? 'Dobles' :
                JuguemosState.mode === 'favoritas' ? 'Favoritas' : 'Personalizadas';
            
            document.getElementById('payment-summary-quantity').textContent = totalTablas;
            document.getElementById('payment-summary-price').textContent = priceText;
        }
        
        selectMethod(method) {
            this.currentMethod = method;
            
            $('.j-payment-method').removeClass('active');
            $(`.j-payment-method[data-method="${method}"]`).addClass('active');
            
            const btn = $('#j-process-payment');
            
            switch(method) {
                case 'paypal':
                    btn.html('<img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;"> Pagar con PayPal');
                    btn.show();
                    break;
                case 'stripe':
                    btn.html('<i class="fas fa-credit-card"></i> Pagar con Tarjeta');
                    btn.show();
                    break;
                case 'zelle':
                    btn.html('<i class="fas fa-mobile-alt"></i> Pagar con Zelle');
                    btn.show();
                    break;
                default:
                    btn.html('Pagar');
                    btn.show();
            }
        }
        
        processPayment() {
            const btn = $('#j-process-payment');
            btn.prop('disabled', true);
            btn.hide();
            $('#j-payment-loading').show();
            
            const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            const subtotal = (JuguemosState.unitPrice || 0) * totalTablas;
            
            const isUSA = JuguemosState.country === 'USA';
            const precioBarajas = isUSA 
                ? (JuguemosState.precioBarajasUSA || 15.00) 
                : (JuguemosState.precioBarajasMexico || 50.00);
            const costoBarajas = JuguemosState.barajasIncluidas ? precioBarajas : 0;
            
            const amount = subtotal + costoBarajas;
            const currency = JuguemosState.currency || 'USD';

            switch(this.currentMethod) {
                case 'paypal':
                    this.processPayPal(amount, currency);
                    break;
                case 'stripe':
                    this.processStripe(amount, currency);
                    break;
                case 'zelle':
                    this.processZelle(amount);
                    break;
                default:
                    alert('Método de pago no disponible');
                    this.restoreButton(btn);
            }
        }
        
        // ==================== PAYPAL (CORREGIDO) ====================
        processPayPal(amount, currency) {
            const order_id = sessionStorage.getItem('juguemos_order_id') || Date.now().toString();
            sessionStorage.setItem('juguemos_order_id', order_id);
            
            // ✅ AGREGAR NONCE
            const nonce = window.Juguemos?.nonce || '';
            
            console.log('PayPal: Enviando petición con nonce:', nonce);
            
            fetch('/wp-content/plugins/juguemos/public/templates/payment/paypal-simple.php', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': nonce
                },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    description: 'Lotería La Dama - Pedido',
                    order_id: order_id,
                    nonce: nonce  // ✅ AGREGADO
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('PayPal Response:', data);
                
                if (data.approve_url) {
                    // Guardar el token real de PayPal
                    if (data.token) {
                        sessionStorage.setItem('juguemos_paypal_token', data.token);
                    }
                    
                    window.open(data.approve_url, '_blank', 'width=800,height=600');
                    this.showWaitingMessage('PayPal');
                    
                    // Verificar con el token de PayPal (no con order_id)
                    this.startPaymentVerification(data.token || order_id);
                } else {
                    alert('Error: ' + (data.error || 'No se pudo crear la orden'));
                    this.restoreButton($('#j-process-payment'));
                }
            })
            .catch(error => {
                console.error('PayPal Error:', error);
                alert('Error de conexión: ' + error.message);
                this.handlePaymentError();
            });
        }
        
        // ==================== STRIPE ====================
        processStripe(amount, currency) {
            const order_id = sessionStorage.getItem('juguemos_order_id') || 'ORDER_' + Date.now();
            sessionStorage.setItem('juguemos_order_id', order_id);
            
            fetch('/wp-content/plugins/juguemos/public/templates/payment/stripe-checkout.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: currency,
                    order_id: order_id
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Stripe response:', data);
                
                if (data.success && data.url) {
                    window.location.href = data.url;
                } else {
                    alert('Error: ' + (data.error || 'No se pudo iniciar el pago con Stripe'));
                    this.restoreButton($('#j-process-payment'));
                }
            })
            .catch(error => {
                console.error('Stripe Error:', error);
                alert('Error de conexión con Stripe');
                this.restoreButton($('#j-process-payment'));
            });
        }
        
        // ==================== ZELLE ====================
        processZelle(amount) {
            const phone = '+1-832-350-3646';
            const order_id = sessionStorage.getItem('juguemos_order_id') || Date.now().toString();
            
            $('#j-process-payment').hide();
            $('#j-payment-loading').hide();
            $('.j-payment-methods').hide();
            
            if (!$('#j-zelle-info').length) {
                $('#juguemos-payment .j-section:last').before(`
                    <div id="j-zelle-info" class="j-section" style="text-align:center;padding:30px;background:#f8f9fa;border-radius:12px;">
                        <h3 style="color:#1E2249;">Pago por Zelle</h3>
                        <p class="j-texto-normal">Envía el pago a:</p>
                        <div style="background:#fff;padding:20px;border-radius:8px;margin:15px auto;max-width:300px;border:2px dashed #FA299C;">
                            <strong style="font-size:20px;color:#FA299C;">${phone}</strong>
                        </div>
                        <p class="j-texto-normal"><strong>Total:</strong> $${amount.toFixed(2)} ${JuguemosState.currency || 'USD'}</p>
                        <p class="j-texto-normal" style="font-size:14px;color:#666;">Después de enviar el pago, haz clic en "Ya pagué"</p>
                        <div style="display:flex;gap:15px;justify-content:center;margin-top:20px;flex-wrap:wrap;">
                            <button id="j-zelle-confirm" class="j-btn-primary" style="background:#25D366;border-color:#25D366;">Ya pagué</button>
                            <button id="j-zelle-cancel" class="j-btn-back">Cancelar</button>
                        </div>
                    </div>
                `);
                
                $('#j-zelle-confirm').on('click', () => {
                    sessionStorage.setItem('juguemos_payment_verified', 'true');
                    sessionStorage.setItem('juguemos_payment_token', order_id);
                    
                    $.ajax({
                        url: Juguemos.ajax_url,
                        method: 'POST',
                        data: {
                            action: 'juguemos_mark_paid',
                            nonce: Juguemos.nonce,
                            token: order_id
                        }
                    });
                    
                    this.paymentSuccess();
                });
                
                $('#j-zelle-cancel').on('click', () => {
                    $('#j-zelle-info').remove();
                    $('.j-payment-methods').show();
                    $('#j-process-payment').show();
                    $('#j-process-payment').prop('disabled', false);
                });
            }
        }
        
        // ==================== MÉTODOS DE UTILIDAD ====================
        restoreButton(btn) {
            btn.prop('disabled', false);
            btn.show();
            $('#j-payment-loading').hide();
        }
        
        handlePaymentError() {
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                this.paymentSuccess();
                return;
            }
            
            alert('Error de conexión. Intenta nuevamente.');
            this.restoreButton($('#j-process-payment'));
        }
        
        showWaitingMessage(method) {
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                this.paymentSuccess();
                return;
            }
            
            $('#j-process-payment').hide();
            $('#j-payment-loading').hide();
            $('.j-payment-methods').hide();
            
            if (!$('#j-waiting-message').length) {
                $('#juguemos-payment .j-section:last').before(`
                <div id="j-waiting-message" class="j-section" style="text-align:center;padding:30px;">
                    <div class="j-spinner"></div>
                    <h3 style="color:#1E2249;">Esperando confirmación de pago</h3>
                    <p class="j-texto-normal">Has sido redirigido a ${method} para completar el pago.</p>
                    <p style="font-size:14px;color:#999;">La página se actualizará automáticamente cuando el pago sea confirmado.</p>
                    <div style="display:flex;justify-content:center;margin-top:15px;">
                        <button id="j-check-payment-status" class="j-btn-primary" style="gap:10px;display:flex;align-items:center;justify-content:center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="23 4 23 10 17 10"></polyline>
                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                            </svg>
                            Verificar estado ahora
                        </button>
                    </div>
                </div>
            `);
    
            $(document).on('click', '#j-check-payment-status', () => {
                this.checkPaymentManually();
            });
        }
        }
        
        checkPaymentManually() {
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                this.paymentSuccess();
                return;
            }
            
            $.ajax({
                url: Juguemos.ajax_url,
                method: 'POST',
                data: {
                    action: 'juguemos_verify_payment',
                    nonce: Juguemos.nonce,
                    token: sessionStorage.getItem('juguemos_payment_token') || ''
                },
                success: (response) => {
                    if (response.success && response.data && response.data.paid) {
                        sessionStorage.setItem('juguemos_payment_verified', 'true');
                        this.paymentSuccess();
                    } else {
                        alert('Aún no se ha confirmado tu pago. Por favor espera unos segundos.');
                    }
                },
                error: () => {
                    alert('Error al verificar el pago. Intenta nuevamente.');
                }
            });
        }
        
        checkPaymentStatus() {
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                setTimeout(() => {
                    this.paymentSuccess();
                }, 100);
                return true;
            }
            
            $.ajax({
                url: Juguemos.ajax_url,
                method: 'POST',
                data: {
                    action: 'juguemos_verify_payment',
                    nonce: Juguemos.nonce,
                    token: sessionStorage.getItem('juguemos_payment_token') || ''
                },
                success: (response) => {
                    if (response.success && response.data && response.data.paid) {
                        sessionStorage.setItem('juguemos_payment_verified', 'true');
                        this.paymentSuccess();
                    }
                }
            });
            
            return false;
        }
        
        startPaymentVerification(order_id) {
            let attempts = 0;
            const maxAttempts = 30;
            const self = this;
            
            const checkPayment = setInterval(function() {
                attempts++;
                
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    clearInterval(checkPayment);
                    self.paymentSuccess();
                    return;
                }
                
                $.ajax({
                    url: Juguemos.ajax_url,
                    method: 'POST',
                    data: {
                        action: 'juguemos_verify_payment',
                        nonce: Juguemos.nonce,
                        token: order_id
                    },
                    success: function(response) {
                        if (response.success && response.data && response.data.paid) {
                            clearInterval(checkPayment);
                            sessionStorage.setItem('juguemos_payment_verified', 'true');
                            sessionStorage.setItem('juguemos_payment_token', order_id);
                            self.paymentSuccess();
                        }
                    }
                });
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkPayment);
                    
                    $('#j-waiting-message').html(
                        '<div style="text-align:center;padding:20px;">' +
                            '<h3 style="color:#FA299C;margin:0 0 10px 0;">El tiempo de espera ha terminado</h3>' +
                            '<p class="j-texto-normal" style="color:#666;font-size:14px;text-align:center;">El pago no se pudo confirmar automáticamente.</p>' +
                            '<p style="font-size:12px;color:#999;margin:5px 0 15px 0;text-align:center;">Puedes intentar nuevamente o seleccionar otro método de pago.</p>' +
                            '<div style="display:flex;flex-direction:column;gap:10px;max-width:300px;margin:0 auto;">' +
                                '<button id="j-retry-payment" class="j-btn-primary" style="background:#FA299C;border-color:#FA299C;width:100%;text-align:center;">Reintentar pago</button>' +
                                '<button id="j-back-to-payment-methods" class="j-btn-back" style="width:100%;text-align:center;justify-content:center;">Volver a métodos de pago</button>' +
                            '</div>' +
                        '</div>'
                    );
                    
                    $(document).off('click', '#j-retry-payment').on('click', '#j-retry-payment', function() {
                        sessionStorage.removeItem('juguemos_payment_verified');
                        sessionStorage.removeItem('juguemos_payment_token');
                        sessionStorage.removeItem('juguemos_order_id');
                        
                        $('#j-waiting-message').remove();
                        $('.j-payment-methods').show();
                        $('#j-process-payment').show();
                        $('#j-process-payment').prop('disabled', false);
                        $('#j-payment-loading').hide();
                    });
                    
                    $(document).off('click', '#j-back-to-payment-methods').on('click', '#j-back-to-payment-methods', function() {
                        $('#j-waiting-message').remove();
                        $('.j-payment-methods').show();
                        $('#j-process-payment').show();
                        $('#j-process-payment').prop('disabled', false);
                        $('#j-payment-loading').hide();
                    });
                }
            }, 3000);
        }
        
        paymentSuccess() {
            if (this.isDownloading) {
                console.log('Descarga ya en proceso, ignorando...');
                return;
            }
            this.isDownloading = true;
            
            $('.j-payment-methods, #j-process-payment, #j-payment-loading').hide();
            $('#j-waiting-message, #j-zelle-info').remove();
            $('#j-download-section').show();
            
            const btnDownload = document.getElementById('j-download-pdf');
            const btnText = document.getElementById('j-download-text');
            
            if (btnDownload) btnDownload.style.display = 'inline-block';
            if (btnText) btnText.textContent = 'Descargar PDF';
            
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            
            setTimeout(() => {
                this.isDownloading = false;
            }, 3000);
        }
    }
    
    $(document).ready(() => {
        window.JuguemosPaymentInstance = new JuguemosPayment();
    });
    
})(jQuery);
