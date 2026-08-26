(function() {
    'use strict';

    class PaymentValidation {
        constructor() {
            this.init();
        }

        init() {
            // Alerta al recargar la página
            this.setupBeforeUnload();
        }

        /**
         * Alerta al recargar la página sin descargar
         */
        setupBeforeUnload() {
            window.addEventListener('beforeunload', (e) => {
                const hasPending = sessionStorage.getItem('juguemos_payment_verified') === 'true' &&
                                  sessionStorage.getItem('juguemos_payment_just_made') === 'true';
                const isAdmin = document.getElementById('j-download-section')?.dataset.admin === 'true';

                if (hasPending && !isAdmin) {
                    e.preventDefault();
                    e.returnValue = 'Aún no has descargado tu PDF. ¿Estás seguro de que quieres recargar? Perderás tu pago.';
                    return e.returnValue;
                }
            });
        }

        /**
         * Limpiar estado de pago (público)
         */
        clearPaymentState() {
            ['juguemos_payment_verified', 'juguemos_payment_token', 'juguemos_payment_just_made', 'juguemos_monto_pagado'].forEach(key => {
                sessionStorage.removeItem(key);
            });
        }
    }

    // Inicializar
    let instance = null;
    window.PaymentValidation = {
        init: function() {
            if (!instance) instance = new PaymentValidation();
            return instance;
        },
        clearPaymentState: function() {
            if (instance) instance.clearPaymentState();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.PaymentValidation.init());
    } else {
        window.PaymentValidation.init();
    }
})();
