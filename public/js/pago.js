(function($) {
    'use strict';
    
    class JuguemosPayment {
        constructor() {
            this.isDownloading = false; 
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
            if (priceEl) priceEl.textContent = '$' + Number(total).toFixed(2) + ' ' + currency;
        }
        
        selectMethod(method) {
            $('.j-payment-method').removeClass('active');
            $('.j-payment-method[data-method="' + method + '"]').addClass('active');
            
            if (method === 'paypal') {
                $('#j-process-payment').html(
                    '<img src="/wp-content/uploads/2026/07/paypal.png" alt="PayPal" style="height:20px;vertical-align:middle;margin-right:8px;"> Pagar con PayPal'
                );
            }
        }
        
        processPayment() {
            const btn = $('#j-process-payment');
            btn.prop('disabled', true);
            btn.hide();
            $('#j-payment-loading').show();
            
            const amount = JuguemosState.total || 1.00;
            const currency = JuguemosState.currency || 'USD';
            
            console.log('Pagando:', amount, currency);
            
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
            .then(async response => {
                const text = await response.text();
                console.log('Respuesta cruda:', text);
                
                try {
                    return JSON.parse(text);
                } catch (e) {
                    console.error('Error al parsear JSON:', e);
                    console.error('Texto recibido:', text);
                    throw new Error('El servidor no devolvió JSON válido');
                }
            })
            .then(data => {
                console.log('Respuesta PayPal:', data);
                
                if (data.approve_url) {
                    window.open(data.approve_url, '_blank', 'width=800,height=600');
                    this.showWaitingMessage();
                    this.startPaymentVerification();
                } else {
                    alert('Error: ' + (data.error || 'No se pudo crear la orden'));
                    btn.prop('disabled', false);
                    btn.show();
                    $('#j-payment-loading').hide();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                
                // ✅ VERIFICAR SI EL PAGO YA ESTÁ VERIFICADO
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    console.log('Pago ya verificado, mostrando descarga...');
                    this.paymentSuccess();
                    return;
                }
                
                alert('Error de conexión. Intenta nuevamente.');
                btn.prop('disabled', false);
                btn.show();
                $('#j-payment-loading').hide();
            });
        }
                
        showWaitingMessage() {
            // ✅ VERIFICAR ANTES DE MOSTRAR ESPERA
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
                        <p class="j-texto-normal">Has sido redirigido a PayPal para completar el pago.</p>
                        <p style="font-size:14px;color:#999;">La página se actualizará automáticamente cuando el pago sea confirmado.</p>
                        <button id="j-check-payment-status" class="j-btn-back" style="margin-top:15px;">Verificar estado ahora</button>
                        <p style="font-size:12px;color:#999;margin-top:10px;">Si ya pagaste, haz clic en "Verificar estado ahora"</p>
                    </div>
                `);
                
                $(document).on('click', '#j-check-payment-status', () => {
                    this.checkPaymentManually();
                });
            }
        }
        
        checkPaymentManually() {
            console.log('Verificando pago manualmente...');
            
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                console.log('Pago confirmado!');
                setTimeout(() => {
                    this.paymentSuccess();
                }, 100);
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
                    console.log('Respuesta del servidor:', response);
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
            console.log('Verificando estado de pago...');
            
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                console.log('Pago ya verificado en sessionStorage');
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
                    console.log('Respuesta verificación:', response);
                    if (response.success && response.data && response.data.paid) {
                        sessionStorage.setItem('juguemos_payment_verified', 'true');
                        this.paymentSuccess();
                    }
                },
                error: (xhr) => {
                    console.log('Error al verificar:', xhr.responseText);
                }
            });
            
            return false;
        }
        
        startPaymentVerification() {
            let attempts = 0;
            const maxAttempts = 30;
            
            const checkPayment = setInterval(() => {
                attempts++;
                console.log('Verificando pago... Intento ' + attempts);
                
                const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
                const paymentToken = sessionStorage.getItem('juguemos_payment_token');
                
                if (paymentVerified && paymentToken) {
                    clearInterval(checkPayment);
                    console.log('Pago confirmado!');
                    this.paymentSuccess();
                }
                
                if (attempts >= maxAttempts) {
                    clearInterval(checkPayment);
                    console.log('Tiempo de espera agotado.');
                    $('#j-waiting-message p:last').before(`
                        <p style="color:#e74c3c;font-weight:bold;">El tiempo de espera ha terminado.</p>
                        <p style="font-size:12px;color:#999;">Si ya realizaste el pago, haz clic en "Verificar estado ahora".</p>
                    `);
                }
            }, 5000);
        }
        
        paymentSuccess() {
            // ✅ EVITAR DESCARGA DUPLICADA
            if (this.isDownloading) {
                console.log('Descarga ya en proceso, ignorando...');
                return;
            }
            this.isDownloading = true;
            
            $('.j-payment-methods').hide();
            $('#j-process-payment').hide();
            $('#j-payment-loading').hide();
            $('#j-waiting-message').remove();
            
            // ✅ Mostrar sección de descarga
            $('#j-download-section').show();
            
            const btnDownload = document.getElementById('j-download-pdf');
            const btnText = document.getElementById('j-download-text');

            if (btnDownload) {
                btnDownload.style.display = 'inline-block';
            }

            if (btnText) {
                btnText.textContent = 'Descargar PDF';
            }
            
            $('#j-download-section h3').text('Pago confirmado');
            
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            
            console.log('Pago confirmado. Esperando que el usuario haga clic en "Descargar PDF"');
            
            // Resetear bandera después de 3 segundos
            setTimeout(() => {
                this.isDownloading = false;
            }, 3000);
        }
    }
    
    $(document).ready(() => {
        window.JuguemosPaymentInstance = new JuguemosPayment();
    });
    
})(jQuery);