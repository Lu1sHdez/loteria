(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.isDownloading = false;
            this.currentMethod = 'stripe_card';
            this.init();
        }
        
        init() {
            this.bindEvents();
            setTimeout(() => {
                this.updatePaymentSummary();
                this.checkPaymentStatus();
                this.updateDefaultButton(); 
            }, 300);
        }

        updateDefaultButton() {
            const btn = $('#j-process-payment');
            const labels = {
                'stripe_card': 'Pagar con Tarjeta',
                'stripe_googlepay': 'Pagar con Google Pay',
                'stripe_applepay': 'Pagar con Apple Pay',
                'paypal': 'Pagar con PayPal'
            };
            btn.text(labels[this.currentMethod] || 'Pagar');
            btn.show();
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
            
            // Mapeo de métodos a textos
            const methodLabels = {
                'stripe_card': 'Pagar con Tarjeta',
                'stripe_googlepay': 'Pagar con Google Pay',
                'stripe_applepay': 'Pagar con Apple Pay',
                'paypal': 'Pagar con PayPal'
            };
            
            // Obtener el texto según el método
            const label = methodLabels[method] || 'Pagar';
            
            // Actualizar el botón (solo texto, sin iconos)
            btn.text(label);
            btn.show();
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
        
            const stripeMethods = ['stripe_card', 'stripe_googlepay', 'stripe_applepay'];
            
            if (stripeMethods.includes(this.currentMethod)) {
                sessionStorage.setItem('juguemos_selected_payment_method', this.currentMethod);
                this.processStripe(amount, currency);
            } else if (this.currentMethod === 'paypal') {
                this.processPayPal(amount, currency);
            } else {
                alert('Método de pago no disponible');
                this.restoreButton(btn);
            }
        }
        
        // ==================== PAYPAL (CORREGIDO) ====================
        processPayPal(amount, currency) {
            const order_id = sessionStorage.getItem('juguemos_order_id') || Date.now().toString();
            sessionStorage.setItem('juguemos_order_id', order_id);
            
            //  AGREGAR NONCE
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
                    nonce: nonce  //  AGREGADO
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
    
    // ✅ GUARDAR EL PASO ACTUAL ANTES DE REDIRIGIR
    sessionStorage.setItem('juguemos_current_step', '4');
    
    //  MOSTRAR MENSAJE DE CARGA
    this.showWaitingMessage('Stripe');
    
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
            // ✅ ABRIR EN VENTANA EMERGENTE (en lugar de redirigir)
            window.open(data.url, '_blank', 'width=800,height=600');
            
            // ✅ Guardar el session_id para verificar después
            if (data.session_id) {
                sessionStorage.setItem('juguemos_stripe_session_id', data.session_id);
            }
            
            // ✅ Iniciar verificación de pago (como con PayPal)
            this.startStripeVerification(order_id, data.session_id);
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
startStripeVerification(order_id, session_id) {
    let attempts = 0;
    const maxAttempts = 30;
    const self = this;
    
    //  Mostrar mensaje de espera
    this.showWaitingMessage('Stripe');
    
    const checkPayment = setInterval(function() {
        attempts++;
        
        // Verificar si ya fue marcado como pagado
        const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const paymentToken = sessionStorage.getItem('juguemos_payment_token');
        
        if (paymentVerified && paymentToken) {
            clearInterval(checkPayment);
            self.paymentSuccess();
            return;
        }
        
        // Verificar con el servidor
        $.ajax({
            url: Juguemos.ajax_url,
            method: 'POST',
            data: {
                action: 'juguemos_verify_stripe',
                nonce: Juguemos.nonce,
                session_id: session_id,
                order_id: order_id
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
            
            // ✅ Si el usuario cerró la ventana sin pagar, mostrar opciones
            $('#j-waiting-message').html(
                '<div style="text-align:center;padding:20px;">' +
                    '<h3 style="color:#F39C12;margin:0 0 10px 0;">⏱️ Tiempo de espera agotado</h3>' +
                    '<p class="j-texto-normal" style="color:#666;font-size:14px;text-align:center;">' +
                        'Si ya realizaste el pago, cierra esta ventana y recarga la página.' +
                    '</p>' +
                    '<div style="display:flex;flex-direction:column;gap:10px;max-width:300px;margin:0 auto;">' +
                        '<button id="j-retry-stripe" class="j-btn-primary" style="background:#635BFF;border-color:#635BFF;width:100%;text-align:center;">' +
                            '🔄 Reintentar pago' +
                        '</button>' +
                        '<button id="j-back-to-payment-methods" class="j-btn-back" style="width:100%;text-align:center;justify-content:center;">' +
                            'Volver a métodos de pago' +
                        '</button>' +
                    '</div>' +
                '</div>'
            );
            
            // Evento para reintentar
            $(document).off('click', '#j-retry-stripe').on('click', '#j-retry-stripe', function() {
                sessionStorage.removeItem('juguemos_payment_verified');
                sessionStorage.removeItem('juguemos_payment_token');
                sessionStorage.removeItem('juguemos_order_id');
                
                $('#j-waiting-message').remove();
                $('.j-payment-methods-grid').show();
                $('#j-process-payment').show();
                $('#j-process-payment').prop('disabled', false);
                $('#j-payment-loading').hide();
            });
            
            // Evento para volver a métodos de pago
            $(document).off('click', '#j-back-to-payment-methods').on('click', '#j-back-to-payment-methods', function() {
                $('#j-waiting-message').remove();
                $('.j-payment-methods-grid').show();
                $('#j-process-payment').show();
                $('#j-process-payment').prop('disabled', false);
                $('#j-payment-loading').hide();
            });
        }
    }, 3000);
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
            $('.j-payment-methods-grid').hide();
            
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
                        $('.j-payment-methods-grid').show();
                        $('#j-process-payment').show();
                        $('#j-process-payment').prop('disabled', false);
                        $('#j-payment-loading').hide();
                    });
                    
                    $(document).off('click', '#j-back-to-payment-methods').on('click', '#j-back-to-payment-methods', function() {
                        $('#j-waiting-message').remove();
                        $('.j-payment-methods-grid').show();
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
            
            $('.j-payment-methods-grid, #j-process-payment, #j-payment-loading').hide();
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
