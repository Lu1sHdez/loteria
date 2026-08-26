(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.isDownloading = false;
            this.currentMethod = 'stripe_card';
            this.isAdmin = document.getElementById('j-download-section')?.dataset.admin === 'true';
            this.minAmounts = {
                'MXN': 10.00,
                'USD': 0.50
            };
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

        // ==================== VALIDACIÓN DE MONTO MÍNIMO ====================
    checkMinimumAmount() {
        const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
        const subtotal = (JuguemosState.unitPrice || 0) * totalTablas;
        
        const isUSA = JuguemosState.country === 'USA';
        const precioBarajas = isUSA 
            ? (JuguemosState.precioBarajasUSA || 15.00) 
            : (JuguemosState.precioBarajasMexico || 50.00);
        const costoBarajas = JuguemosState.barajasIncluidas ? precioBarajas : 0;
        
        const amount = subtotal + costoBarajas;
        const currency = JuguemosState.currency || 'USD';
        const minAmount = this.minAmounts[currency] || 0.50;
        
        return {
            isBelowMinimum: amount < minAmount,
            amount: amount,
            minAmount: minAmount,
            currency: currency,
            minText: '$' + minAmount.toFixed(2) + ' ' + currency
        };
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
        
        updateMinimumAmountWarning() {
            const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            const subtotal = (JuguemosState.unitPrice || 0) * totalTablas;
            
            const isUSA = JuguemosState.country === 'USA';
            const precioBarajas = isUSA 
                ? (JuguemosState.precioBarajasUSA || 15.00) 
                : (JuguemosState.precioBarajasMexico || 50.00);
            const costoBarajas = JuguemosState.barajasIncluidas ? precioBarajas : 0;
            
            const amount = subtotal + costoBarajas;
            const currency = JuguemosState.currency || 'USD';
            const minAmount = this.minAmounts[currency] || 0.50;
            const isBelowMinimum = amount < minAmount;
            const minText = '$' + minAmount.toFixed(2) + ' ' + currency;
            
            const stripeMethods = ['stripe_card', 'stripe_googlepay', 'stripe_applepay'];
            const isStripeSelected = stripeMethods.includes(this.currentMethod);
            
            let warningEl = document.getElementById('j-minimum-amount-warning');
            let minTextEl = document.getElementById('j-min-amount-text');
            let labelEl = document.getElementById('j-min-amount-label');
            let actionEl = document.getElementById('j-min-amount-action');
            
            if (warningEl) {
                // 🔥 TRADUCCIONES
                const translations = {
                    'es': {
                        label: 'El monto mínimo para pagar con tarjeta es de',
                        action: 'Agrega más tablas o usa PayPal.'
                    },
                    'en': {
                        label: 'The minimum amount to pay by card is',
                        action: 'Add more boards or use PayPal.'
                    }
                };
                
                const lang = isUSA ? 'en' : 'es';
                const t = translations[lang];
                
                // 🔥 ACTUALIZAR SOLO EL TEXTO (NO RECREAR EL HTML)
                if (minTextEl) minTextEl.textContent = minText;
                if (labelEl) labelEl.textContent = t.label;
                if (actionEl) actionEl.textContent = t.action;
                
                // 🔥 MOSTRAR/OCULTAR
                if (isStripeSelected && isBelowMinimum) {
                    warningEl.style.display = 'block';
                } else {
                    warningEl.style.display = 'none';
                }
            }
            
            this.updatePaymentButtonState(isBelowMinimum);
        }
        updatePaymentButtonState(isBelowMinimum) {
            const btn = $('#j-process-payment');
            const currentMethod = this.currentMethod;
            const stripeMethods = ['stripe_card', 'stripe_googlepay', 'stripe_applepay'];
            const isStripe = stripeMethods.includes(currentMethod);
            
            if (isStripe && isBelowMinimum) {
                btn.prop('disabled', true);
                btn.css({
                    'opacity': '0.5',
                    'cursor': 'not-allowed',
                    'background': '#cccccc',
                    'border-color': '#cccccc'
                });
            } else {
                btn.prop('disabled', false);
                btn.css({
                    'opacity': '1',
                    'cursor': 'pointer',
                    'background': '',
                    'border-color': ''
                });
            }
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
            
            // 🔥 MAPA DE TRADUCCIONES
            const translations = {
                'Sencilla': 'Simple',
                'Dobles': 'Doubles',
                'Favoritas': 'Favorites',
                'Personalizadas': 'Custom'
            };
            
            // 🔥 OBTENER EL TEXTO SEGÚN EL MODO
            let modeText = 
                JuguemosState.mode === 'sencilla' ? 'Sencilla' :
                JuguemosState.mode === 'dobles' ? 'Dobles' :
                JuguemosState.mode === 'favoritas' ? 'Favoritas' : 'Personalizadas';
            
            // 🔥 SI ES USA, TRADUCIR
            if (JuguemosState.country === 'USA') {
                modeText = translations[modeText] || modeText;
            }
            
            // 🔥 ACTUALIZAR EL TEXTO (AHORA CON TRADUCCIÓN MANUAL)
            document.getElementById('payment-summary-mode').textContent = modeText;
            document.getElementById('payment-summary-quantity').textContent = totalTablas;
            document.getElementById('payment-summary-price').textContent = priceText;

            this.updateMinimumAmountWarning();
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
            this.updateMinimumAmountWarning();

        }
        

        
        processPayment() {
            const btn = $('#j-process-payment');
            
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
            
            btn.prop('disabled', true);
            btn.hide();
            $('#j-payment-loading').show();
            
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
                    nonce: nonce
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
                    if (data.token) {
                        sessionStorage.setItem('juguemos_paypal_token', data.token);
                    }
                    
                    window.open(data.approve_url, '_blank', 'width=800,height=600');
                    this.showWaitingMessage('PayPal');
                    
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
        // ==================== STRIPE (CORREGIDO - IGUAL QUE PAYPAL) ====================
        processStripe(amount, currency) {
            const order_id = sessionStorage.getItem('juguemos_order_id') || Date.now().toString();
            sessionStorage.setItem('juguemos_order_id', order_id);
            
            sessionStorage.setItem('juguemos_current_step', '4');
            
            this.showWaitingMessage('Stripe');
            
            const nonce = window.Juguemos?.nonce || '';
            
            fetch('/wp-content/plugins/juguemos/public/templates/payment/stripe-checkout.php', {
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
                    nonce: nonce
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Stripe Response:', data);
                
                if (data.success && data.url) {
                    if (data.session_id) {
                        sessionStorage.setItem('juguemos_stripe_session_id', data.session_id);
                    }
                    
                    window.open(data.url, '_blank', 'width=800,height=600');
                    
                    this.startPaymentVerification(data.session_id || order_id);
                    
                } else {
                    this.handleStripeError(data.error, currency);
                    this.restoreButton($('#j-process-payment'));
                }
            })
            .catch(error => {
                console.error('Stripe Error:', error);
                alert('Error de conexión: ' + error.message);
                this.handlePaymentError();
            });
        }
        

        handleStripeError(error, currency) {
            // Error genérico
            alert('Error al procesar el pago: ' + (error || 'Intenta nuevamente.'));
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

            const justMade = sessionStorage.getItem('juguemos_payment_just_made') === 'true';

            
            if (paymentVerified && paymentToken&& justMade) {
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
            
            // Detectar si es Stripe o PayPal
            const isStripe = sessionStorage.getItem('juguemos_stripe_session_id') !== null;
            
            const checkPayment = setInterval(function() {
                attempts++;
                
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    clearInterval(checkPayment);
                    self.paymentSuccess();
                    return;
                }
                
                // Construir datos según el método
                let data = { nonce: Juguemos.nonce };
                
                if (isStripe) {
                    data.action = 'juguemos_verify_stripe';
                    data.session_id = sessionStorage.getItem('juguemos_stripe_session_id');
                    data.order_id = order_id;
                } else {
                    data.action = 'juguemos_verify_payment';
                    data.token = order_id;
                }
                
                $.ajax({
                    url: Juguemos.ajax_url,
                    method: 'POST',
                    data: data,
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
                    
                    // Mensaje de timeout con colores existentes
                    $('#j-waiting-message').html(
                        '<div style="text-align:center;padding:20px;">' +
                            '<p class="text-rosa-negrita md">Tiempo de espera agotado</p>' +
                            '<p class="j-texto-normal md">Si ya realizaste el pago, cierra esta ventana y recarga la página.</p>' +
                            '<button id="j-retry-payment" class="j-btn-primary">Reintentar pago</button>' +
                            '<button id="j-back-to-payment-methods" class="j-btn-back">Volver a métodos de pago</button>' +
                        '</div>'
                    );
                    
                    // Evento reintentar
                    $(document).off('click', '#j-retry-payment').on('click', '#j-retry-payment', function() {
                        sessionStorage.removeItem('juguemos_payment_verified');
                        sessionStorage.removeItem('juguemos_payment_token');
                        sessionStorage.removeItem('juguemos_order_id');
                        sessionStorage.removeItem('juguemos_stripe_session_id');
                        sessionStorage.removeItem('juguemos_paypal_token');
                        
                        $('#j-waiting-message').remove();
                        $('.j-payment-methods-grid').show();
                        $('#j-process-payment').show().prop('disabled', false);
                        $('#j-payment-loading').hide();
                    });
                    
                    // Evento volver
                    $(document).off('click', '#j-back-to-payment-methods').on('click', '#j-back-to-payment-methods', function() {
                        $('#j-waiting-message').remove();
                        $('.j-payment-methods-grid').show();
                        $('#j-process-payment').show().prop('disabled', false);
                        $('#j-payment-loading').hide();
                    });
                }
            }, 3000);
        }
        
        
       paymentSuccess(forceDownload = false) {
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
            
            if (this.isAdmin) {
                sessionStorage.setItem('juguemos_payment_token', 'admin_' + Date.now());
            }
            
            const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            const subtotal = (JuguemosState.unitPrice || 0) * totalTablas;
            const isUSA = JuguemosState.country === 'USA';
            const precioBarajas = isUSA ? (JuguemosState.precioBarajasUSA || 15.00) : (JuguemosState.precioBarajasMexico || 50.00);
            const costoBarajas = JuguemosState.barajasIncluidas ? precioBarajas : 0;
            const montoPagado = subtotal + costoBarajas;
            
            sessionStorage.setItem('juguemos_monto_pagado', montoPagado.toString());
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            sessionStorage.setItem('juguemos_payment_just_made', 'true');
            
            setTimeout(() => {
                this.isDownloading = false;
            }, 3000);
        }
    }
    
    
    $(document).ready(() => {
        window.JuguemosPaymentInstance = new JuguemosPayment();
    });
    
})(jQuery);
