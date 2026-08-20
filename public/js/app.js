document.addEventListener("DOMContentLoaded", () => {

    // ========== LIMPIEZA DE SESSION ==========
    if (sessionStorage.getItem('juguemos_page_loaded')) {
        ['juguemos_payment_verified', 'juguemos_payment_token', 'juguemos_page_loaded', 'juguemos_order_id'].forEach(key => {
            sessionStorage.removeItem(key);
        });
    } else {
        sessionStorage.setItem('juguemos_page_loaded', 'true');
    }

    // ========== INICIALIZACIÓN ==========
    if (typeof JuguemosAjax !== 'undefined' && typeof JuguemosState !== 'undefined') {
        JuguemosAjax.loadCategories();
        updatePrice();
        updatePaperOptions();
    } else {
        console.error('JuguemosAjax o JuguemosState no están definidos');
        return;
    }

    // ========== HELPER: ACTUALIZAR Y REGENERAR ==========
    const actualizarYRegenerar = (callback) => {
        updatePrice();
        updateOrderSummary();
        if (typeof callback === 'function') setTimeout(callback, 200);
    };

    // ========== PAPEL ==========
    const paperSelect = document.getElementById("j-paper-size");
    if (paperSelect) {
        paperSelect.addEventListener("change", function () {
            JuguemosState.paper = this.value;
            updateOrderSummary();
            PrintPaper.render();
        });
    }

    // ========== RANGE Y INPUT DE TABLAS ==========
    const range = document.getElementById("tables-range");
    const input = document.getElementById("tables-number");

    if (range && input) {
        const updateRangeColor = () => {
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            const value = parseInt(range.value) || 0;
            const percentage = ((value - min) / (max - min)) * 100;
            range.style.background = `linear-gradient(to right, #24B8C8 0%, #24B8C8 ${percentage}%, #E5E5E5 ${percentage}%, #E5E5E5 100%)`;
        };

        range.addEventListener("input", () => {
            input.value = range.value;
            JuguemosState.quantity = parseInt(range.value);
            updateRangeColor();
            actualizarYRegenerar(llenarCasillasAutomatico);
        });

        input.addEventListener("input", () => {
            let value = parseInt(input.value) || parseInt(range.min) || 0;
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            value = Math.max(min, Math.min(max, value));
            range.value = input.value = value;
            JuguemosState.quantity = value;
            updateRangeColor();
            actualizarYRegenerar(llenarCasillasAutomatico);
        });

        document.querySelector(".j-number-btn.plus")?.addEventListener("click", () => {
            input.stepUp();
            input.dispatchEvent(new Event("input"));
        });

        document.querySelector(".j-number-btn.minus")?.addEventListener("click", () => {
            input.stepDown();
            input.dispatchEvent(new Event("input"));
        });

        updateRangeColor();
    }
    // ========== MODO ==========
    document.querySelectorAll(".j-mode").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-mode").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            const mode = button.dataset.mode;
            JuguemosState.mode = mode;
            
            // Obtener todos los contenedores
            const aleatoriaOption = document.getElementById('j-aleatoria-option');
            const doblesOption = document.getElementById('j-dobles-option');
            const favoritasOption = document.getElementById('j-favoritas-option');
            const libreUpload = document.getElementById('j-libre-upload');
            
            // Ocultar todos
            if (aleatoriaOption) aleatoriaOption.style.display = 'none';
            if (doblesOption) doblesOption.style.display = 'none';
            if (favoritasOption) favoritasOption.style.display = 'none';
            if (libreUpload) libreUpload.style.display = 'none';
            
            //  LIMPIAR posiciones dobles si NO es modo dobles
            if (mode !== 'dobles') {
                JuguemosState.posicionesDobles = [];
                JuguemosState.cartasDobles = [];
                JuguemosState.asignacionDobles = {};
            }
            
            // Mostrar según modo
            if (mode === 'libre') {
                if (libreUpload) libreUpload.style.display = 'block';
            } else if (mode === 'dobles') {
                if (doblesOption) doblesOption.style.display = '';
                setTimeout(() => {
                    if (typeof window.DoblesManager !== 'undefined') {
                        window.DoblesManager.init();
                        drawGrid();
                    }
                }, 100);
            } else if (mode === 'favoritas') {
                if (favoritasOption) favoritasOption.style.display = '';
                // SIMPLIFICADO: Solo llamar a actualizarCasillas
                if (window.FavoritasManagerInstance) {
                    setTimeout(() => {
                        window.FavoritasManagerInstance.actualizarCasillasFavoritas();
                    }, 100);
                }
            } else {
                // Modo sencilla (por defecto)
                if (aleatoriaOption) aleatoriaOption.style.display = '';
            }
            
            setTimeout(() => {
                drawGrid();
                var event = new Event('gridChanged');
                document.dispatchEvent(event);
            }, 50);
            
            actualizarYRegenerar(llenarCasillasAutomatico);
        });
    });
    // ========== GRID ==========
    const handleGridChange = () => {
        drawGrid();
        drawMarcosPreview();
        limpiarCasillas();
        updateOrderSummary();
        
        //  Si el modo NO es dobles, limpiar posiciones dobles
        if (JuguemosState.mode !== 'dobles') {
            JuguemosState.posicionesDobles = [];
            JuguemosState.cartasDobles = [];
            JuguemosState.asignacionDobles = {};
        }

        if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
            setTimeout(() => {
                window.FavoritasManagerInstance.actualizarPreviewCasillas();
                if (typeof llenarCasillasAutomatico === 'function') {
                    llenarCasillasAutomatico();
                }
            }, 100);
            return; 
        }
        
        if (JuguemosState.mode === 'dobles' && typeof window.DoblesManager !== 'undefined') {
            setTimeout(() => {
                window.DoblesManager.refreshPreview();
                drawGrid();
            }, 50);
        }
        
        setTimeout(llenarCasillasAutomatico, 200);
        var event = new Event('gridChanged');
        document.dispatchEvent(event);
    };

    document.querySelectorAll(".j-grid").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-grid").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.grid = button.dataset.grid;
            handleGridChange();
        });
    });
    drawGrid();

    // ========== ORIENTACIÓN ==========
    document.querySelectorAll(".j-orientation").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-orientation").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.orientation = button.dataset.orientation;
            updateOrderSummary();
            var event = new Event('gridChanged');
            document.dispatchEvent(event);
        });
    });

    // ========== TABLAS POR HOJA ==========
    const tablesPerPageInput = document.getElementById("j-tables-per-page");
    if (tablesPerPageInput) {
        const updateTables = () => {
            JuguemosState.quantity = parseInt(tablesPerPageInput.value) || 1;
            updatePrice();        
            updateOrderSummary();

            var event = new Event('gridChanged');
            document.dispatchEvent(event);
        };
        tablesPerPageInput.value = JuguemosState.quantity;
        document.querySelector(".j-tables-per-page-plus")?.addEventListener("click", () => {
            tablesPerPageInput.stepUp();
            updateTables();
        });
        document.querySelector(".j-tables-per-page-minus")?.addEventListener("click", () => {
            tablesPerPageInput.stepDown();
            updateTables();
        });
        tablesPerPageInput.addEventListener("input", updateTables);
    }

    // ========== PÁGINAS ==========
    const pagesInput = document.getElementById("j-pages");
    if (pagesInput) {
        pagesInput.value = JuguemosState.pages;
        document.querySelector(".j-pages-plus")?.addEventListener("click", () => {
            pagesInput.stepUp();
            pagesInput.dispatchEvent(new Event("input"));
        });
        document.querySelector(".j-pages-minus")?.addEventListener("click", () => {
            pagesInput.stepDown();
            pagesInput.dispatchEvent(new Event("input"));
        });
        pagesInput.addEventListener("input", () => {
            let value = parseInt(pagesInput.value) || 1;
            pagesInput.value = JuguemosState.pages = Math.max(1, value);
            updatePrice();        // ← NUEVO: Actualizar precio al cambiar páginas
            updateOrderSummary();
            if (typeof PrintPaper !== "undefined") {
                setTimeout(() => PrintPaper.refresh(), 150);
            }
            var event = new Event('gridChanged');
            document.dispatchEvent(event);
        });
    }

    // ========== MARCAS DE CORTE ==========
    const cutMarksToggle = document.getElementById("j-cut-marks-toggle");
    const cutMarksLines = document.querySelectorAll("#j-cut-marks-preview .j-line");
    if (cutMarksToggle) {
        cutMarksToggle.checked = JuguemosState.cutMarks;
        cutMarksLines.forEach(line => line.style.display = JuguemosState.cutMarks ? "" : "none");
        cutMarksToggle.addEventListener("change", () => {
            JuguemosState.cutMarks = cutMarksToggle.checked;
            updateOrderSummary();
            cutMarksLines.forEach(line => line.style.display = JuguemosState.cutMarks ? "" : "none");
        });
    }

    // ========== COLORES ==========

// 1. Color de Marco (12 colores)
document.querySelectorAll(".j-color-swatch").forEach(swatch => {
    swatch.addEventListener("click", function() {
        document.querySelectorAll(".j-color-swatch").forEach(s => s.classList.remove("active"));
        this.classList.add("active");
        JuguemosState.marcoColor = this.dataset.color;
        
        // Actualizar indicador
        const display = document.getElementById('j-marco-color-display');
        const preview = document.getElementById('j-marco-color-preview');
        if (display) display.textContent = this.dataset.color;
        if (preview) preview.style.background = this.dataset.color;
        
        aplicarColores();
        if (typeof updateOrderSummary === 'function') updateOrderSummary();
        var event = new Event('gridChanged');
        document.dispatchEvent(event);
    });
});

// 2. Color Fondo de Tabla (12 colores)
document.querySelectorAll(".j-fondo-swatch").forEach(swatch => {
    swatch.addEventListener("click", function() {
        document.querySelectorAll(".j-fondo-swatch").forEach(s => s.classList.remove("active"));
        this.classList.add("active");
        JuguemosState.fondoColor = this.dataset.color;
        
        // Actualizar indicador
        const display = document.getElementById('j-fondo-color-display');
        const preview = document.getElementById('j-fondo-color-preview');
        if (display) display.textContent = this.dataset.color;
        if (preview) preview.style.background = this.dataset.color;
        
        aplicarColores();
        if (typeof updateOrderSummary === 'function') updateOrderSummary();
        var event = new Event('gridChanged');
        document.dispatchEvent(event);
    });
});

// 3. Función para aplicar colores
function aplicarColores() {
    document.documentElement.style.setProperty('--j-marco-color', JuguemosState.marcoColor || '#FA299C');
    document.documentElement.style.setProperty('--j-fondo-color', JuguemosState.fondoColor || '#FA299C');
}

// 4. Inicializar colores al cargar
function inicializarColores() {
    // Marco
    const marcoActivo = document.querySelector('.j-color-swatch.active');
    if (marcoActivo) {
        JuguemosState.marcoColor = marcoActivo.dataset.color;
        const display = document.getElementById('j-marco-color-display');
        const preview = document.getElementById('j-marco-color-preview');
        if (display) display.textContent = marcoActivo.dataset.color;
        if (preview) preview.style.background = marcoActivo.dataset.color;
    } else {
        const primerMarco = document.querySelector('.j-color-swatch');
        if (primerMarco) {
            primerMarco.classList.add('active');
            JuguemosState.marcoColor = primerMarco.dataset.color;
            const display = document.getElementById('j-marco-color-display');
            const preview = document.getElementById('j-marco-color-preview');
            if (display) display.textContent = primerMarco.dataset.color;
            if (preview) preview.style.background = primerMarco.dataset.color;
        }
    }

    // Fondo
    const fondoActivo = document.querySelector('.j-fondo-swatch.active');
    if (fondoActivo) {
        JuguemosState.fondoColor = fondoActivo.dataset.color;
        const display = document.getElementById('j-fondo-color-display');
        const preview = document.getElementById('j-fondo-color-preview');
        if (display) display.textContent = fondoActivo.dataset.color;
        if (preview) preview.style.background = fondoActivo.dataset.color;
    } else {
        const primerFondo = document.querySelector('.j-fondo-swatch');
        if (primerFondo) {
            primerFondo.classList.add('active');
            JuguemosState.fondoColor = primerFondo.dataset.color;
            const display = document.getElementById('j-fondo-color-display');
            const preview = document.getElementById('j-fondo-color-preview');
            if (display) display.textContent = primerFondo.dataset.color;
            if (preview) preview.style.background = primerFondo.dataset.color;
        }
    }

    aplicarColores();
}

inicializarColores();


// ========== TOGGLE INCLUIR BARAJAS ==========
const btnIncluir = document.getElementById("j-incluir-barajas");
const toggleIcon = document.getElementById("j-toggle-icon");
if (btnIncluir) {

    const setActive = (active) => {
        JuguemosState.barajasIncluidas = active;

                const textSpan = btnIncluir.querySelector('.j-toggle-text');
        if (textSpan) {
            textSpan.textContent = active ? 'Incluir barajas' : 'No incluir barajas';
        }
                toggleIcon.src =
            `/wp-content/uploads/2026/07/incluir_${active ? "on" : "off"}.png`;
        
        const statusText = document.getElementById("j-incluir-status");
        if (statusText) {
            statusText.style.display = 'none';
        }
        
        updateOrderSummary();
        if (typeof PrintPaper !== "undefined") {
            setTimeout(() => PrintPaper.refresh(), 150);
        }
        var event = new Event('gridChanged');
        document.dispatchEvent(event);
    };
    
    // Por defecto DESACTIVADO
    setActive(false);
    
    btnIncluir.addEventListener("click", () => {
        setActive(!JuguemosState.barajasIncluidas);
    });
}

    // ========== SELECCIÓN ALEATORIA ==========
    const btnAleatoria = document.querySelector(".j-casilla-btn");
    if (btnAleatoria) {
        btnAleatoria.classList.remove('active');
        btnAleatoria.classList.add('inactive');
        btnAleatoria.textContent = 'Selección Aleatoria';

        btnAleatoria.addEventListener("click", function() {
            if (!JuguemosState.deck) {
                alert('Primero selecciona un diseño.');
                return;
            }

            if (JuguemosState.barajas.length === 0) {
                JuguemosAjax.loadBarajas(JuguemosState.deck).then(() => {
                    llenarCasillasAleatorio();
                    updateOrderSummary();
                });
            } else {
                llenarCasillasAleatorio();
                updateOrderSummary();
            }
            
            //  Mantener el botón siempre como "inactive" (sin resaltar)
            this.classList.remove('active');
            this.classList.add('inactive');
            this.textContent = 'Selección Aleatoria';
        });
    }

    limpiarCasillas();
    drawMarcosPreview();

   // ========== SIGUIENTE: VISTA PREVIA ==========
        document.getElementById("j-go-preview")?.addEventListener("click", () => {
        
        //  VALIDACIÓN PARA MODO LIBRE
        if (JuguemosState.mode === 'libre') {
            const count = JuguemosState.libreImagesCount || 0;
            if (count < 54) {
                alert('Debes subir las 54 imágenes personalizadas antes de continuar.');
                return;
            }
        }
        
        //  NUEVO: VALIDACIÓN PARA MODO FAVORITAS
        if (JuguemosState.mode === 'favoritas') {
            const favoritas = JuguemosState.favoritas || [];
            
            // También verificar desde el manager si existe
            let totalFavoritas = favoritas.length;
            if (window.FavoritasManagerInstance) {
                const favoritasDelManager = window.FavoritasManagerInstance.getFavoritas();
                if (favoritasDelManager.length > 0) {
                    totalFavoritas = favoritasDelManager.length;
                    // Sincronizar estado
                    JuguemosState.favoritas = favoritasDelManager;
                }
            }
            
            if (totalFavoritas === 0) {
                alert('Selecciona al menos 1 favorita antes de continuar.');
                return;
            }
        }

        //  NUEVO: VALIDACIÓN PARA MODO DOBLES (opcional)
        if (JuguemosState.mode === 'dobles') {
            const cartasDobles = JuguemosState.cartasDobles || [];
            if (cartasDobles.length === 0) {
                alert('No se generaron cartas dobles. Intenta nuevamente.');
                return;
            }
            console.log('Cartas dobles generadas:', cartasDobles.length);
        }

        //  NUEVO: VALIDACIÓN GENERAL - Que haya un diseño seleccionado
        if (!JuguemosState.deck) {
            alert('Selecciona un diseño de lotería primero.');
            return;
        }

        //  NUEVO: VALIDACIÓN - Que haya barajas cargadas
        if (!JuguemosState.barajas || JuguemosState.barajas.length === 0) {
            alert('No se cargaron las barajas. Intenta seleccionar otro diseño.');
            return;
        }

        // 🔥 1. Sincronizar favoritas desde el manager ANTES de generar
        if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
            const favs = window.FavoritasManagerInstance.getFavoritas();
            if (favs.length > 0) {
                JuguemosState.favoritas = favs;
                JuguemosState.favoritasUbicacion = window.FavoritasManagerInstance.getUbicacion();
            }
        }

        // 🔥 2. Generar TODAS las tablas directamente (sin duplicar llamadas)
        if (typeof ejecutarLlenadoAleatorio === 'function') {
            ejecutarLlenadoAleatorio();
        } else {
            console.error('ejecutarLlenadoAleatorio no está definido');
            return;
        }

        updateOrderSummary();

        // Cambiar a paso 3
        document.querySelectorAll(".j-step").forEach(s => s.classList.remove("active"));
        document.getElementById("j-tables-per-page").value = JuguemosState.quantity;
        document.getElementById("juguemos-preview-completo").classList.add("active");
        document.querySelectorAll(".juguemos-step").forEach(s => s.classList.remove("active"));
        document.querySelector('.juguemos-step[data-step="3"]')?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });

        // 🔥 3. Forzar actualización de PrintPaper (ya tiene todasLasTablas generado)
        if (typeof PrintPaper !== 'undefined') {
            PrintPaper.refresh();
        }

        // Verificar retorno de Stripe
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'stripe_success') {
            const sessionId = urlParams.get('session_id');
            const orderId = urlParams.get('order_id');
            
            if (sessionId && orderId) {
                sessionStorage.setItem('juguemos_payment_token', orderId);
                
                $.ajax({
                    url: Juguemos.ajax_url,
                    method: 'POST',
                    data: {
                        action: 'juguemos_verify_stripe',
                        nonce: Juguemos.nonce,
                        session_id: sessionId,
                        order_id: orderId
                    },
                    success: function(response) {
                        if (response.success && response.data && response.data.paid) {
                            sessionStorage.setItem('juguemos_payment_verified', 'true');
                            if (typeof JuguemosPaymentInstance !== 'undefined') {
                                JuguemosPaymentInstance.paymentSuccess();
                            }
                        } else {
                            // Intentar verificar manualmente
                            setTimeout(function() {
                                if (typeof JuguemosPaymentInstance !== 'undefined') {
                                    JuguemosPaymentInstance.checkPaymentManually();
                                }
                            }, 3000);
                        }
                    },
                    error: function() {
                        // Intentar verificar manualmente
                        setTimeout(function() {
                            if (typeof JuguemosPaymentInstance !== 'undefined') {
                                JuguemosPaymentInstance.checkPaymentManually();
                            }
                        }, 3000);
                    }
                });
            }
        }
    });

    // ========== EDITAR PEDIDO ==========
    document.getElementById("j-edit-order")?.addEventListener("click", () => {
        ['juguemos_payment_verified', 'juguemos_payment_token', 'juguemos_page_loaded', 'juguemos_order_id'].forEach(key => {
            sessionStorage.removeItem(key);
        });
        document.getElementById("tables-number").value = JuguemosState.quantity;
        document.getElementById("tables-range").value = JuguemosState.quantity;
        document.getElementById("tables-range").dispatchEvent(new Event("input"));
        document.querySelectorAll(".j-step").forEach(s => s.classList.remove("active"));
        document.getElementById("juguemos-design").classList.add("active");
        document.querySelectorAll(".juguemos-step").forEach(s => s.classList.remove("active"));
        document.querySelector('.juguemos-step[data-step="1"]')?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ========== CONFIRMAR PEDIDO ==========
    document.getElementById("j-confirm-order")?.addEventListener("click", () => {
        if (typeof updatePrice === 'function') updatePrice();
        document.querySelectorAll(".j-step").forEach(s => s.classList.remove("active"));
        document.getElementById("juguemos-payment").classList.add("active");
        document.querySelectorAll(".juguemos-step").forEach(s => s.classList.remove("active"));
        document.querySelector('.juguemos-step[data-step="4"]')?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => {
            updateOrderSummary();
            JuguemosPaymentInstance?.updatePaymentSummary();
        }, 200);
    });

    // ========== OBSERVAR PASO 4 ==========
    new MutationObserver(() => {
        if (document.getElementById('juguemos-payment')?.classList.contains('active')) {
            setTimeout(() => {
                updateOrderSummary();
                JuguemosPaymentInstance?.updatePaymentSummary();
            }, 200);
        }
    }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

    // ========== REGRESAR A VISTA PREVIA ==========
    document.getElementById("j-back-to-preview")?.addEventListener("click", () => {
        ['juguemos_payment_verified', 'juguemos_payment_token'].forEach(key => sessionStorage.removeItem(key));
        document.querySelectorAll(".j-step").forEach(s => s.classList.remove("active"));
        document.getElementById("juguemos-preview-completo").classList.add("active");
        document.querySelectorAll(".juguemos-step").forEach(s => s.classList.remove("active"));
        document.querySelector('.juguemos-step[data-step="3"]')?.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => PrintPaper?.refresh(), 300);
    });

    // ========== VERIFICAR PAGO ==========
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('download') === 'pdf') {
        const verified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const token = sessionStorage.getItem('juguemos_payment_token');
        if (verified && token) {
            setTimeout(() => {
                JuguemosPDF?.generate();
                if (window.history?.replaceState) window.history.replaceState({}, document.title, window.location.pathname);
            }, 800);
        } else {
            console.warn('No se encontró verificación de pago');
            setTimeout(() => window.location.href = '/juguemos', 2000);
        }
    }

    if (document.getElementById('juguemos-payment')?.classList.contains('active')) {
        const verified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const token = sessionStorage.getItem('juguemos_payment_token');
        if (verified && token) {
            JuguemosPaymentInstance?.paymentSuccess();
        }
    }

    window.addEventListener('message', (event) => {
        if (event.data?.type === 'paypal_payment_completed') {
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            sessionStorage.setItem('juguemos_payment_token', event.data.token || 'verified');
            JuguemosPaymentInstance?.paymentSuccess();
        }
    });

    document.getElementById('j-download-pdf')?.addEventListener('click', (e) => {
        e.preventDefault();
        const verified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const token = sessionStorage.getItem('juguemos_payment_token');
        if (verified && token) {
            JuguemosPDF?.generate();
        } else {
            alert('Por favor, realiza el pago antes de descargar el PDF.');
        }
    });

    // Inicializar visibilidad según el modo actual
    const initialMode = JuguemosState.mode || 'sencilla';
    const aleatoriaOption = document.getElementById('j-aleatoria-option');
    const doblesOption = document.getElementById('j-dobles-option');
    const favoritasOption = document.getElementById('j-favoritas-option');
    const libreUpload = document.getElementById('j-libre-upload');

    // Ocultar todos
    if (aleatoriaOption) aleatoriaOption.style.display = 'none';
    if (doblesOption) doblesOption.style.display = 'none';
    if (favoritasOption) favoritasOption.style.display = 'none';
    if (libreUpload) libreUpload.style.display = 'none';

    // Mostrar según modo
    if (initialMode === 'libre') {
        if (libreUpload) libreUpload.style.display = 'block';
    } else if (initialMode === 'dobles') {
        if (doblesOption) doblesOption.style.display = '';
    } else if (initialMode === 'favoritas') {
        if (favoritasOption) favoritasOption.style.display = '';
    } else {
        if (aleatoriaOption) aleatoriaOption.style.display = '';
    }

});

// =========================================================
// FUNCIONES GLOBALES
// =========================================================

function updatePrice() {
    if (typeof JuguemosAjax !== 'undefined' && typeof JuguemosState !== 'undefined') {
        const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
        JuguemosAjax.loadPrice(JuguemosState.country, JuguemosState.mode, totalTablas);
    }
}

function updatePaperOptions() {
    const select = document.getElementById("j-paper-size");
    if (!select) return;
    const isMexico = JuguemosState.country === "Mexico";
    select.innerHTML = isMexico ? `
        <option value="carta">Carta (21.59 × 27.94 cm)</option>
        <option value="oficio">Oficio (21.59 × 33.02 cm)</option>
        <option value="a4">Tabloide (21 × 29.7 cm)</option>
    ` : `
        <option value="letter">Letter (8.5 × 11 in)</option>
        <option value="legal">Legal (8.5 × 14 in)</option>
        <option value="a4">Tabloid (8.27 × 11.69 in)</option>
    `;
    select.selectedIndex = 0;
    JuguemosState.paper = select.value;
}

function drawGrid() {
    const grid = JuguemosState.grid || '4x4';
    const container = document.getElementById('j-grid-preview');
    if (!container) return;
    
    container.dataset.grid = grid;
    
    const config = getGridConfig(grid);
    container.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    
    const modo = JuguemosState.mode || 'sencilla';
    const esCruzadas = grid === 'cruzadas';
    const total = config.total;
    const esModoDobles = modo === 'dobles';
    const esModoFavoritas = modo === 'favoritas';
    
    let html = '';
    
    if (esCruzadas) {
        // =========================================================
        // CRUZADAS: 8 celdas visibles, 8 celdas invisibles
        // =========================================================
        const casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
        var icono = getIconoPorModo(modo);
        
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4) + 1;
            const col = (i % 4) + 1;
            const esVisible = casillasVisibles.includes(i);
            
            if (esVisible) {
                if (esModoFavoritas) {
                    var posicionesFavoritasCruzadas = [0, 15]; // 2 posiciones fijas
                    
                    if (posicionesFavoritasCruzadas.includes(i)) {
                        html += `
                            <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                                ${icono ? '<img src="' + icono + '" class="j-modo-icon" alt="Favoritas" loading="lazy">' : ''}
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="cell visible-sin-fondo" style="grid-row: ${row}; grid-column: ${col};"></div>
                        `;
                    }
                } else if (esModoDobles) {
                    // DOBLES: solo 2 con relleno
                    var posicionesDobles = [0, 15];
                    if (posicionesDobles.includes(i)) {
                        var iconoDoble = getIconoPorModo('dobles');
                        html += `
                            <div class="cell doble-ubicacion" style="grid-row: ${row}; grid-column: ${col};">
                                ${iconoDoble ? '<img src="' + iconoDoble + '" class="j-modo-icon dobles" alt="Dobles" loading="lazy">' : ''}
                            </div>
                        `;
                    } else {
                        html += `
                            <div class="cell visible-sin-fondo" style="grid-row: ${row}; grid-column: ${col};"></div>
                        `;
                    }
                } else {
                    // SENCILLA: todas rellenas
                    html += `
                        <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                            ${icono ? '<img src="' + icono + '" class="j-modo-icon" alt="' + modo + '" loading="lazy">' : ''}
                        </div>
                    `;
                }
            } else {
                // 8 celdas invisibles: completamente vacías
                html += `
                    <div class="cell invisible" style="grid-row: ${row}; grid-column: ${col};"></div>
                `;
            }
        }
    } else {
        // =========================================================
        // GRIDS NORMALES (4x4, 5x5, pocitos)
        // =========================================================
        
        if (esModoDobles) {
            // MODO DOBLES: solo 2 rellenas
            var posicionesFijas = obtenerPosicionesDoblesEstaticas(grid);
            var iconoDoble = getIconoPorModo('dobles');
            
            for (var i = 0; i < total; i++) {
                var esDoble = posicionesFijas.includes(i);
                
                if (esDoble) {
                    html += `
                        <div class="cell doble-ubicacion">
                            ${iconoDoble ? '<img src="' + iconoDoble + '" class="j-modo-icon dobles" alt="Dobles" loading="lazy">' : ''}
                        </div>
                    `;
                } else {
                    html += `
                        <div class="cell sin-relleno"></div>
                    `;
                }
            }
        } else if (esModoFavoritas) {
            // =========================================================
            // MODO FAVORITAS: según el grid
            // =========================================================
            var icono = getIconoPorModo('favoritas');
            var posicionesFavoritas = obtenerPosicionesFavoritasEstaticas(grid);
            
            for (var i = 0; i < total; i++) {
                var esFavorita = posicionesFavoritas.includes(i);
                
                if (esFavorita) {
                    html += `
                        <div class="cell">
                            ${icono ? '<img src="' + icono + '" class="j-modo-icon" alt="Favoritas" loading="lazy">' : ''}
                        </div>
                    `;
                } else {
                    
                    html += `
                        <div class="cell sin-relleno"></div>
                    `;
                }
            }
        } else {
            // MODO SENCILLA, LIBRE: TODAS LAS CELDAS RELLENAS
            var icono = getIconoPorModo(modo);
            
            for (var i = 0; i < total; i++) {
                html += `
                    <div class="cell">
                        ${icono ? '<img src="' + icono + '" class="j-modo-icon" alt="' + modo + '" loading="lazy">' : ''}
                    </div>
                `;
            }
        }
    }
    
    container.innerHTML = html;

    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}

// =========================================================
// POSICIONES FIJAS PARA FAVORITAS (ESTÁTICAS)
// =========================================================

function obtenerPosicionesFavoritasEstaticas(grid) {
    var total = getTotalCasillas(grid);
    var cantidad = 12;
    
    if (total < 12) {
        cantidad = total;
    }
    
    if (grid === 'pocitos3') {
        return [1];
    }
    
    if (grid === 'pocitos4') {
        return [0, 1];
    }
    
    var indices = Array.from({ length: total }, function(_, i) { return i; });
    
    for (var i = indices.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = indices[i];
        indices[i] = indices[j];
        indices[j] = temp;
    }
    
    return indices.slice(0, cantidad);
}

function obtenerPosicionesDoblesEstaticas(grid) {
    var posiciones = {
        '4x4': [5, 6],
        '5x5': [7, 17],
        'pocitos4': [0, 1],
        'pocitos3': [1, 2]
    };
    
    if (!posiciones[grid]) {
        var total = getTotalCasillas(grid);
        var centro = Math.floor(total / 2);
        return [centro - 1, centro];
    }
    
    return posiciones[grid];
}

function getTotalCasillas(grid) {
    const config = getGridConfig(grid);
    return config.total;
}

function llenarCasillasAleatorio() {
    if (!JuguemosState.deck) { alert('Primero selecciona un diseño.'); return; }
    if (!JuguemosState.barajas?.length) { alert('No hay barajas disponibles para este diseño.'); return; }
    ejecutarLlenadoAleatorio();
    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}
function actualizarPreviewCasillas(casillas) {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    
    // Configurar grid según tipo
    if (grid === 'pocitos4') {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else if (grid === 'pocitos3') {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else if (grid === 'cruzadas') {
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';
        container.style.gridTemplateRows = 'repeat(4, 1fr)';
    } else {
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
    }
    
    const favoritas = JuguemosState.favoritas || [];
    const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';
    
    let posicionesDobles = [];
    const esModoDobles = JuguemosState.mode === 'dobles';
    
    if (esModoDobles) {
        if (JuguemosState.posicionesDoblesFijas && JuguemosState.posicionesDoblesFijas.length > 0) {
            posicionesDobles = JuguemosState.posicionesDoblesFijas;
        } else if (typeof GridPosiciones !== 'undefined') {
            const ubicacion = JuguemosState.ubicacionDoble || 'aleatoria';
            posicionesDobles = GridPosiciones.getPositions(ubicacion, grid, 2);
            JuguemosState.posicionesDoblesFijas = posicionesDobles;
        }
        JuguemosState.posicionesDobles = posicionesDobles;
    }
    

    if (!casillas || casillas.length === 0) {
        const total = getTotalCasillas(grid);
        container.innerHTML = Array(total).fill('<div class="cell loading"></div>').join('');
        return;
    }

    const esLibreCruzadas = JuguemosState.mode === 'libre' && grid === 'cruzadas';
    const esFavoritasCruzadas = JuguemosState.mode === 'favoritas' && grid === 'cruzadas';
    const esSencillaCruzadas = JuguemosState.mode === 'sencilla' && grid === 'cruzadas';
    
    // CASO 1: LIBRE + CRUZADAS
    if (esLibreCruzadas) {
        const casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
        const imagenesLibre = JuguemosState.libreImages || [];
        const totalImagenesSubidas = imagenesLibre.length;
        
        let html = '';
        for (let i = 0; i < 8; i++) {
            const pos = casillasVisibles[i];
            const row = Math.floor(pos / 4) + 1;
            const col = (pos % 4) + 1;
            
            const imagen = (i < totalImagenesSubidas) ? imagenesLibre[i] : null;
            const tieneImagen = imagen && imagen.data && imagen.data.length > 0;
            
            if (tieneImagen) {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                        <img src="${imagen.data}" alt="Personalizada ${i + 1}" loading="lazy">
                    </div>
                `;
            } else {
                html += `
                    <div class="cell visible placeholder" style="grid-row: ${row}; grid-column: ${col};">
                    </div>
                `;
            }
        }
        container.innerHTML = html;
        return;
    }
    
    // CASO 2: SENCILLA + CRUZADAS
    if (esSencillaCruzadas) {
        const casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
        
        let html = '';
        for (let i = 0; i < 8; i++) {
            const pos = casillasVisibles[i];
            const row = Math.floor(pos / 4) + 1;
            const col = (pos % 4) + 1;
            
            const casilla = casillas && casillas[i] ? casillas[i] : null;
            
            if (casilla) {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                        <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                    </div>
                `;
            } else {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                    </div>
                `;
            }
        }
        container.innerHTML = html;
        return;
    }
    
    // CASO 3: FAVORITAS + CRUZADAS (con distribución inteligente)
    if (esFavoritasCruzadas) {
        const casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
        let html = '';
        
        // 🔥 OBTENER UBICACIONES SELECCIONADAS (checkboxes)
        const ubicacionesSeleccionadas = [];
        document.querySelectorAll('.j-ubicacion-checkbox:checked').forEach(cb => {
            ubicacionesSeleccionadas.push(cb.dataset.ubicacion);
        });
        if (ubicacionesSeleccionadas.length === 0) {
            ubicacionesSeleccionadas.push('aleatoria');
        }

        // 🔥 DISTRIBUIR FAVORITAS usando FavoritasDistribucion
        let distribucion = [];
        if (typeof FavoritasDistribucion !== 'undefined') {
            distribucion = FavoritasDistribucion.distribuir(
                favoritas,
                1, // Solo mostramos la primera tabla
                grid,
                ubicacionesSeleccionadas
            );
        } else {
            // Fallback si no está cargado el script
            distribucion = favoritas.map((f, i) => ({
                posicion: i < casillasVisibles.length ? casillasVisibles[i] : i,
                favorita: f,
                ubicacion: 'aleatoria'
            }));
        }

        // 🔥 Generar 16 celdas (4x4) con las 8 visibles en forma de X
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4) + 1;
            const col = (i % 4) + 1;
            const esVisible = casillasVisibles.includes(i);
            
            if (esVisible) {
                // Buscar si hay una favorita asignada a esta posición
                const item = distribucion.find(d => d.posicion === i);
                const casilla = item ? item.favorita : null;
                const esFavorita = casilla !== null;
                
                if (casilla) {
                    html += `
                        <div class="cell visible favorita" style="grid-row: ${row}; grid-column: ${col};">
                            <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                            <span class="j-favorita-badge">⭐</span>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                        </div>
                    `;
                }
            } else {
                // Celdas invisibles: completamente vacías
                html += `
                    <div class="cell invisible" style="grid-row: ${row}; grid-column: ${col};"></div>
                `;
            }
        }
        container.innerHTML = html;
        return;
    }
    
    // CASO 4: DOBLES + CRUZADAS
    if (grid === 'cruzadas' && esModoDobles) {
        const casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
        const cartaDoble = JuguemosState.cartasDobles && JuguemosState.cartasDobles.length > 0 ? JuguemosState.cartasDobles[0] : null;
        
        let html = '';
        for (let i = 0; i < 8; i++) {
            const pos = casillasVisibles[i];
            const row = Math.floor(pos / 4) + 1;
            const col = (pos % 4) + 1;
            const esDoble = posicionesDobles.includes(i);
            
            let casilla = null;
            if (esDoble && cartaDoble) {
                casilla = cartaDoble;
            } else {
                casilla = casillas && casillas[i] ? casillas[i] : null;
            }
            
            if (casilla) {
                html += `
                    <div class="cell visible ${esDoble ? 'doble' : ''}" style="grid-row: ${row}; grid-column: ${col};">
                        <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        ${esDoble ? '<span class="j-doble-badge">×2</span>' : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                    </div>
                `;
            }
        }
        container.innerHTML = html;
        return;
    }

    if (tieneFavoritas && (grid === '4x4' || grid === '5x5' || grid === 'pocitos4' || grid === 'pocitos3')) {
        const total = getTotalCasillas(grid);
        
        const ubicacionesSeleccionadas = [];
        document.querySelectorAll('.j-ubicacion-checkbox:checked').forEach(cb => {
            ubicacionesSeleccionadas.push(cb.dataset.ubicacion);
        });
        if (ubicacionesSeleccionadas.length === 0) {
            ubicacionesSeleccionadas.push('aleatoria');
        }

        let favoritasParaMostrar = favoritas;
        if (grid === 'pocitos4') {
            favoritasParaMostrar = favoritas.slice(0, 2);
        }

        let distribucion = [];
        if (typeof FavoritasDistribucion !== 'undefined') {
            distribucion = FavoritasDistribucion.distribuir(
                favoritasParaMostrar,   
                1,
                grid,
                ubicacionesSeleccionadas
            );
        } else {
            const posiciones = [];
            for (let i = 0; i < Math.min(favoritasParaMostrar.length, total); i++) {
                posiciones.push(i);
            }
            distribucion = favoritasParaMostrar.slice(0, posiciones.length).map((f, i) => ({
                posicion: posiciones[i],
                favorita: f,
                ubicacion: 'aleatoria'
            }));
        }

        // Generar HTML
        let html = '';
        for (let i = 0; i < total; i++) {
            const item = distribucion.find(d => d.posicion === i);
            if (item) {
                html += `
                    <div class="cell favorita" data-index="${i}" data-ubicacion="${item.ubicacion}">
                        <img src="${item.favorita.imagen || ''}" alt="${item.favorita.nombre || ''}" loading="lazy">
                        <span class="j-favorita-badge">⭐</span>
                    </div>
                `;
            } else {
                html += `<div class="cell empty" data-index="${i}"></div>`;
            }
        }
        container.innerHTML = html;
        return;
    }

    if (JuguemosState.mode !== 'favoritas') {
        const total = getTotalCasillas(grid);
        container.innerHTML = casillas.map(function(casilla, index) {
            const esFavorita = false; // No aplica en modo no-favoritas
            const esDoble = esModoDobles && posicionesDobles.includes(index);
            const claseExtra = esDoble ? ' doble' : '';
            
            if (casilla) {
                return `
                    <div class="cell${claseExtra}" data-index="${index}" title="${casilla.nombre || ''}${esDoble ? ' ×2 Doble' : ''}">
                        <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        ${esDoble ? '<span class="j-doble-badge">×2</span>' : ''}
                    </div>
                `;
            } else {
                return '<div class="cell empty" data-index="' + index + '"></div>';
            }
        }).join('');
        
        JuguemosState.casillasAsignadas = casillas;
    }
}
function limpiarCasillas() {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    
    //  Si es Pocitos 4, usar 2x2
    if (grid === 'pocitos4') {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
    }
    
    const total = getTotalCasillas(grid);
    container.innerHTML = Array(total).fill('<div class="cell empty"></div>').join('');
    JuguemosState.casillasAsignadas = [];
    JuguemosState.todasLasTablas = [];

    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}

function aplicarColores() {
    document.documentElement.style.setProperty('--j-marco-color', JuguemosState.marcoColor || '#FA299C');
    document.documentElement.style.setProperty('--j-fondo-color', JuguemosState.fondoColor || '#FFFFFF');

    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}

function drawMarcosPreview() {
    const container = document.getElementById('j-marcos-preview-grid');
    if (!container) return;
    
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    
    const config = getGridConfig(grid);
    container.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    container.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;
    
    const total = config.total;
    let html = '';
    
    for (let i = 0; i < total; i++) {
        html += `<div class="cell"></div>`;
    }
    
    container.innerHTML = html;

    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}
function getGridConfig(grid) {
    const configs = {
        '4x4': { cols: 4, rows: 4, total: 16 },
        '5x5': { cols: 5, rows: 5, total: 25 },
        'pocitos4': { cols: 2, rows: 2, total: 4 },
        'pocitos3': { cols: 2, rows: 2, total: 3 },
        'cruzadas': { cols: 4, rows: 4, total: 16 }
    };
    return configs[grid] || configs['4x4'];
}
function getIconoPorModo(modo) {
    const iconos = {
        'sencilla': '/wp-content/uploads/2026/08/sencilla-on.png',
        'dobles': '/wp-content/uploads/2026/08/dobles_icon.png',
        'favoritas': '/wp-content/uploads/2026/08/fav_icon.png',
        'libre': '/wp-content/uploads/2026/08/per_icon.png'
    };
    return iconos[modo] || null;
}

function updateOrderSummary() {
    const total = JuguemosState.total || 0;
    const currency = JuguemosState.currency || 'USD';
    const country = JuguemosState.country || 'Mexico';
    const mode = JuguemosState.mode || 'sencilla';
    const quantity = JuguemosState.quantity || 0;
    const pages = JuguemosState.pages || 1;
    const totalTablas = quantity * pages;
    const modeLabels = {
        'sencilla': 'Sencilla',
        'dobles': 'Dobles',
        'favoritas': 'Favoritas',
        'libre': 'Personalizadas'
    };
    const modeLabel = modeLabels[mode] || mode;   
    const isUSA = country === 'USA';
    const precioBarajas = isUSA 
        ? (JuguemosState.precioBarajasUSA || 15.00) 
        : (JuguemosState.precioBarajasMexico || 50.00);
    const barajasIncluidas = JuguemosState.barajasIncluidas || false;
    const costoBarajas = barajasIncluidas ? precioBarajas : 0;
    const totalFinal = total + costoBarajas;
    const priceText = '$' + Number(totalFinal).toFixed(2) + ' ' + currency;
    
    const ubicacionLabels = {
        'aleatoria': 'Aleatoria',   
        'centro': 'Centro',         
        'esquinas': 'Esquinas',     
        'marco': 'Marco'            
    };
    const ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
    const ubicacionLabel = mode === 'favoritas' ? ubicacionLabels[ubicacion] || 'Random' : '';

    const elementos = {
        'payment-summary-country': country,
        'payment-summary-mode': modeLabel,
        'payment-summary-quantity': totalTablas,
        'payment-summary-price': priceText,
        'summary-country': country,
        'summary-mode': modeLabel,
        'summary-quantity': totalTablas,
        'summary-price': priceText,
        'j-summary-tables': `${quantity} tablas por hoja × ${pages} páginas = ${totalTablas} tablas`,
        'j-summary-cards': JuguemosState.mode === 'libre' 
        ? (JuguemosState.libreImagesCount === 54 
            ? '54 barajas' 
            : `${JuguemosState.libreImagesCount || 0}/54 barajas`)
        : `${JuguemosState.barajas?.length || 0} barajas`,
        'j-summary-paper': PrintPaper.getPaperLabel(),        
        'j-summary-orientation': JuguemosState.orientation === "vertical" ? "Vertical" : "Horizontal",
        'j-summary-pages': `${JuguemosState.pages} páginas`,
        'j-summary-grid': (function() {
            const grid = JuguemosState.grid || '4x4';
            const titles = {
                '4x4': '4x4',
                '5x5': '5x5',
                'pocitos4': 'Pocitos 4',
                'pocitos3': 'Pocitos 3',
                'cruzadas': 'Cruzadas'
            };
            const subtitles = {
                '4x4': '16 casillas',
                '5x5': '25 casillas',
                'pocitos4': '4 casillas',
                'pocitos3': '3 casillas',
                'cruzadas': '8 casillas'
            };
            return `<span class="grid-title">${titles[grid] || '4x4'}</span><span class="grid-subtitle">${subtitles[grid] || '16 casillas'}</span>`;
        })(),        
        'j-summary-mode': modeLabel,
        'j-summary-cutmarks': JuguemosState.cutMarks ? "Líneas de corte" : "Sin líneas de corte",
        'j-summary-libre': JuguemosState.mode === 'libre' ? 
            (JuguemosState.libreImagesCount === 54 ? 'Completo (54/54)' : `${JuguemosState.libreImagesCount || 0}/54 imagenes`) : 'No aplica',
        'j-summary-ubicacion': mode === 'favoritas' ? `Ubicación: ${ubicacionLabel}` : ''
    };
    

    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'j-summary-grid') {
                el.innerHTML = elementos[id];
            } else {
                if (el.textContent !== elementos[id]) {
                    el.textContent = elementos[id];
                }
            }
        }
    });
}
function regenerarTodasLasTablas() { 
    llenarCasillasAleatorio(); 
    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}

// =========================================================
// PAÍS Y GTRANSLATE
// =========================================================
function cambiarIdiomaGTtranslate(lang) {
    const country = lang === 'en' ? 'USA' : 'Mexico';
    document.cookie = `juguemos_country=${country}; path=/; max-age=31536000`;
    const url = new URL(window.location.href);
    url.searchParams.set('lang', lang);
    window.location.href = url.toString();
}

function sincronizarPais() {
    const lang = new URLSearchParams(window.location.search).get('lang');
    const country = lang === 'en' ? 'USA' : lang === 'es' ? 'Mexico' : getCookie('juguemos_country') || 'Mexico';
    document.querySelectorAll(".country").forEach(btn => {
        btn.classList.toggle('active', btn.dataset.country === country);
    });
    JuguemosState.country = country;
    JuguemosState.currency = country === 'USA' ? 'USD' : 'MXN';
    updatePaperOptions();
    updatePrice();
    updateOrderSummary();

    var event = new Event('gridChanged');
    document.dispatchEvent(event);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

document.querySelectorAll(".country").forEach(button => {
    button.addEventListener("click", function() {
        document.querySelectorAll(".country").forEach(b => b.classList.remove("active"));
        this.classList.add("active");
        const country = this.dataset.country;
        JuguemosState.country = country;
        JuguemosState.currency = country === 'USA' ? 'USD' : 'MXN';
        cambiarIdiomaGTtranslate(country === 'USA' ? 'en' : 'es');
    });
});

function detectarGTranslate() {
    const selector = document.querySelector('.goog-te-combo');
    if (selector && !selector._listenerAdded) {
        selector._listenerAdded = true;
        selector.addEventListener('change', function() {
            const lang = this.value;
            const country = lang === 'en' ? 'USA' : 'Mexico';
            JuguemosState.country = country;
            JuguemosState.currency = country === 'USA' ? 'USD' : 'MXN';
            document.cookie = `juguemos_country=${country}; path=/; max-age=31536000`;
            document.querySelectorAll(".country").forEach(btn => btn.classList.toggle('active', btn.dataset.country === country));
            updatePaperOptions();
            updatePrice();
            updateOrderSummary();
        });
    }
}

new MutationObserver(() => {
    const selector = document.querySelector('.goog-te-combo');
    if (selector && !selector._listenerAdded) detectarGTranslate();
}).observe(document.body, { childList: true, subtree: true });
function llenarCasillasAutomatico() {
    if (!JuguemosState.deck) return;
    
    // Sincronizar favoritas
    if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
        var favoritasDelManager = window.FavoritasManagerInstance.getFavoritas();
        var ubicacionDelManager = window.FavoritasManagerInstance.getUbicacion();
        
        if (favoritasDelManager.length > 0) {
            JuguemosState.favoritas = favoritasDelManager;
            JuguemosState.favoritasUbicacion = ubicacionDelManager;
        }
    }

    if (!JuguemosState.barajas || JuguemosState.barajas.length === 0) {
        JuguemosAjax.loadBarajas(JuguemosState.deck).then(function() {
            if (JuguemosState.barajas.length > 0) {
                ejecutarLlenadoAleatorio();
            }
        });
        return;
    }
    ejecutarLlenadoAleatorio();
}

function ejecutarLlenadoAleatorio() {
    if (!JuguemosState.barajas?.length) {
        console.warn('ejecutarLlenadoAleatorio: No hay barajas');
        return;
    }
    
    const grid = JuguemosState.grid || '4x4';
    const totalCasillas = getTotalCasillas(grid);
    const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);

    if (!totalCasillas) {
        console.warn('ejecutarLlenadoAleatorio: totalCasillas es 0');
        return;
    }

    console.log('ejecutarLlenadoAleatorio - Iniciando:', {
        modo: JuguemosState.mode,
        grid: grid,
        totalCasillas: totalCasillas,
        totalTablas: totalTablas,
        barajas: JuguemosState.barajas.length
    });

    const todasLasTablas = [];
    const todasLasBarajas = [...JuguemosState.barajas];
    
    // =========================================================
    // 🔥 OBTENER FAVORITAS
    // =========================================================
    
    let favoritas = [];
    let ubicacion = 'aleatoria';
    let tieneFavoritas = false;
    
    if (JuguemosState.mode === 'favoritas') {
        if (window.FavoritasManagerInstance) {
            const favoritasDelManager = window.FavoritasManagerInstance.getFavoritas();
            const ubicacionDelManager = window.FavoritasManagerInstance.getUbicacion();
            
            if (favoritasDelManager && favoritasDelManager.length > 0) {
                favoritas = favoritasDelManager;
                ubicacion = ubicacionDelManager;
                tieneFavoritas = true;
                JuguemosState.favoritas = favoritas;
                JuguemosState.favoritasUbicacion = ubicacion;
                
                console.log('Favoritas sincronizadas desde manager:', favoritas.length);
            }
        }
        
        if (!tieneFavoritas) {
            const favoritasEstado = JuguemosState.favoritas || [];
            if (favoritasEstado.length > 0) {
                favoritas = favoritasEstado;
                ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
                tieneFavoritas = true;
                console.log('Favoritas desde estado global:', favoritas.length);
            }
        }
    }

    // =========================================================
    // 🔥 CONFIGURACIÓN DE DOBLES
    // =========================================================
    
    let configDoblesPorTabla = [];
    if (JuguemosState.mode === 'dobles') {
        let posicionesDobles = [];
        if (typeof GridPosiciones !== 'undefined') {
            const ubicacionDoble = JuguemosState.ubicacionDoble || 'aleatoria';
            posicionesDobles = GridPosiciones.getPositions(ubicacionDoble, grid, 2);
        } else if (typeof window.DoblesManager !== 'undefined') {
            posicionesDobles = window.DoblesManager.obtenerPosicionesPorUbicacion(grid, 2);
        }
        
        JuguemosState.posicionesDobles = posicionesDobles;
        JuguemosState.posicionesDoblesFijas = posicionesDobles;
        
        let posicionesParaAsignar = posicionesDobles;
        if (grid === 'cruzadas') {
            const mapaPosiciones = { 0: 0, 1: 3, 2: 5, 3: 6, 4: 9, 5: 10, 6: 12, 7: 15 };
            posicionesParaAsignar = posicionesDobles.map(p => mapaPosiciones[p] ?? p);
        }
        
        for (let t = 0; t < totalTablas; t++) {
            const barajasMezcladas = [...todasLasBarajas];
            for (let i = barajasMezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [barajasMezcladas[i], barajasMezcladas[j]] = [barajasMezcladas[j], barajasMezcladas[i]];
            }
            
            const cartaDoble = barajasMezcladas[0];
            configDoblesPorTabla.push({
                carta: cartaDoble,
                posiciones: posicionesParaAsignar,
                asignacion: { [cartaDoble.numero]: posicionesParaAsignar }
            });
        }
        
        JuguemosState.cartasDobles = configDoblesPorTabla.map(c => c.carta);
        JuguemosState.asignacionDobles = configDoblesPorTabla.reduce((acc, c, idx) => {
            acc[idx] = c.asignacion;
            return acc;
        }, {});
        
        drawGrid();
    }

    // =========================================================
    // 🔥 GENERAR CADA TABLA
    // =========================================================
    
    // Pre-calcular favoritas por tabla para Pocitos 4
    let favoritasPorTabla = [];
    let totalFavoritasPorTabla = 0;
    
    if (grid === 'pocitos4' && tieneFavoritas && favoritas.length > 0) {
        const maxPorTabla = 2;
        const totalTablasNecesarias = Math.ceil(favoritas.length / maxPorTabla);
        totalFavoritasPorTabla = totalTablasNecesarias;
        
        console.log(`📊 Pocitos 4: ${favoritas.length} favoritas en ${totalTablasNecesarias} tablas`);
        
        for (let t = 0; t < totalTablas; t++) {
            const tablaIndex = t % totalTablasNecesarias;
            const inicio = tablaIndex * maxPorTabla;
            const fin = Math.min(inicio + maxPorTabla, favoritas.length);
            const favoritasParaEstaTabla = favoritas.slice(inicio, fin);
            
            favoritasPorTabla.push(favoritasParaEstaTabla);
        }
    }
    
    for (let t = 0; t < totalTablas; t++) {
        const casillas = new Array(totalCasillas).fill(null);
        const copiaBarajas = [...todasLasBarajas];
        
        // =========================================================
        // 🔥 COLOCAR FAVORITAS - CASO ESPECIAL POCITOS 4
        // =========================================================
        
        if (grid === 'pocitos4' && tieneFavoritas && favoritas.length > 0) {
            const favoritasParaEstaTabla = favoritasPorTabla[t] || [];
            
            if (favoritasParaEstaTabla.length > 0) {
                const posicionesFavoritas = obtenerPosicionesFavoritas(grid, favoritasParaEstaTabla.length, ubicacion);
                
                console.log(`📊 Tabla ${t + 1}: ${favoritasParaEstaTabla.length} favoritas en posiciones:`, posicionesFavoritas);
                
                favoritasParaEstaTabla.forEach((favorita, idx) => {
                    const pos = posicionesFavoritas[idx] !== undefined ? posicionesFavoritas[idx] : idx;
                    if (pos < totalCasillas && !casillas[pos]) {
                        casillas[pos] = favorita;
                        const indexEnCopia = copiaBarajas.findIndex(b => b.numero === favorita.numero);
                        if (indexEnCopia !== -1) {
                            copiaBarajas.splice(indexEnCopia, 1);
                        }
                    }
                });
            }
        }
        // =========================================================
        // 🔥 COLOCAR FAVORITAS - OTROS GRIDS (4x4, 5x5, Cruzadas)
        // =========================================================
        else if (tieneFavoritas && favoritas.length > 0 && JuguemosState.mode === 'favoritas') {
            // Distribuir favoritas entre tablas
            const favoritasPorTablaNormal = distribuirFavoritasPorTablas(favoritas, totalTablas, totalCasillas);
            const favoritasTabla = favoritasPorTablaNormal[t] || [];
            
            if (favoritasTabla.length > 0) {
                const posicionesFavoritas = obtenerPosicionesFavoritas(grid, favoritasTabla.length, ubicacion);
                
                favoritasTabla.forEach((favorita, idx) => {
                    const pos = posicionesFavoritas[idx] !== undefined ? posicionesFavoritas[idx] : idx;
                    if (pos < totalCasillas && !casillas[pos]) {
                        casillas[pos] = favorita;
                        const indexEnCopia = copiaBarajas.findIndex(b => b.numero === favorita.numero);
                        if (indexEnCopia !== -1) {
                            copiaBarajas.splice(indexEnCopia, 1);
                        }
                    }
                });
            }
        }
        
        // =========================================================
        // 🔥 COLOCAR DOBLES
        // =========================================================
        
        if (configDoblesPorTabla.length > 0 && configDoblesPorTabla[t]) {
            const config = configDoblesPorTabla[t];
            const asignacion = config.asignacion;
            
            Object.keys(asignacion).forEach(numeroCarta => {
                const posiciones = asignacion[numeroCarta];
                const carta = todasLasBarajas.find(b => b.numero == numeroCarta);
                
                if (carta && posiciones && posiciones.length === 2) {
                    posiciones.forEach(pos => {
                        if (pos < totalCasillas && !casillas[pos]) {
                            casillas[pos] = carta;
                        }
                    });
                    
                    const indexEnCopia = copiaBarajas.findIndex(b => b.numero == numeroCarta);
                    if (indexEnCopia !== -1) {
                        copiaBarajas.splice(indexEnCopia, 1);
                    }
                }
            });
        }
        
        // =========================================================
        // 🔥 LLENAR RESTO CON BARAJAJAS ALEATORIAS
        // =========================================================
        
        for (let i = 0; i < totalCasillas; i++) {
            if (!casillas[i]) {
                let baraja = null;
                let intentos = 0;
                
                while (!baraja && intentos < 50 && copiaBarajas.length > 0) {
                    const idx = Math.floor(Math.random() * copiaBarajas.length);
                    const candidata = copiaBarajas[idx];
                    
                    const esFavorita = tieneFavoritas && favoritas.some(f => f.numero === candidata.numero);
                    const esDoble = configDoblesPorTabla[t]?.carta?.numero == candidata.numero;
                    
                    if (!esFavorita && !esDoble) {
                        baraja = copiaBarajas.splice(idx, 1)[0];
                    } else {
                        copiaBarajas.push(copiaBarajas.splice(idx, 1)[0]);
                    }
                    intentos++;
                }
                
                if (!baraja && copiaBarajas.length > 0) {
                    baraja = copiaBarajas.pop();
                }
                
                if (!baraja) {
                    baraja = todasLasBarajas[Math.floor(Math.random() * todasLasBarajas.length)];
                }
                
                casillas[i] = baraja;
            }
        }
        
        todasLasTablas.push(casillas);
    }
    
    JuguemosState.todasLasTablas = todasLasTablas;

    // =========================================================
    // 🔥 ACTUALIZAR VISTA PREVIA DE CASILLAS
    // =========================================================
    
    if (todasLasTablas.length > 0) {
        const tablaMostrar = todasLasTablas[0];
        JuguemosState.casillasAsignadas = tablaMostrar;
        
        // Para Pocitos 4, usar la vista previa del manager que ya tiene rotación
        if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
            window.FavoritasManagerInstance.actualizarPreviewCasillas();
        } else {
            actualizarPreviewCasillas(tablaMostrar);
        }
    } else {
        const container = document.getElementById('j-casilla-preview-grid');
        if (container) {
            const total = getTotalCasillas(JuguemosState.grid || '4x4');
            container.innerHTML = Array(total).fill('<div class="cell loading"></div>').join('');
        }
    }
    var event = new Event('gridChanged');
    document.dispatchEvent(event);
    
}

function obtenerPosicionesFavoritas(grid, cantidad, ubicacion) {
    const total = getTotalCasillas(grid);
    const cantidadReal = Math.min(cantidad, total);
    
    if (cantidadReal === 0) return [];
    if (cantidadReal >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    switch (ubicacion) {
        case 'centro':
            return obtenerPosicionesCentro(grid, cantidadReal);
        case 'esquinas':
            return obtenerPosicionesEsquinas(grid, cantidadReal);
        case 'marco':
            return obtenerPosicionesMarco(grid, cantidadReal);
        case 'aleatoria':
        default:
            return obtenerPosicionesAleatorias(grid, cantidadReal);
    }
}

function obtenerPosicionesAleatorias4x4(cantidad) {
    const total = 16;
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, cantidad);
}

function obtenerPosicionesAleatorias(grid, cantidad) {
    const total = getTotalCasillas(grid);
    const indices = Array.from({ length: total }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, cantidad);
}

function obtenerPosicionesCentro(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    const centroCol = (cols - 1) / 2;
    const centroRow = (rows - 1) / 2;
    const posiciones = [];
    const distanciaMap = new Map();
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            const dist = Math.sqrt(Math.pow(r - centroRow, 2) + Math.pow(c - centroCol, 2));
            distanciaMap.set(idx, dist);
            posiciones.push(idx);
        }
    }
    
    posiciones.sort((a, b) => distanciaMap.get(a) - distanciaMap.get(b));
    return posiciones.slice(0, cantidad);
}

function obtenerPosicionesEsquinas(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    const posiciones = [];
    const usadas = new Set();
    const esquinas = [0, cols - 1, (rows - 1) * cols, (rows - 1) * cols + cols - 1];
    
    for (const pos of esquinas) {
        if (pos < total && !usadas.has(pos) && posiciones.length < cantidad) {
            posiciones.push(pos);
            usadas.add(pos);
        }
    }
    
    if (posiciones.length < cantidad) {
        const vecinosPorEsquina = [];
        for (const pos of esquinas) {
            if (pos >= total) continue;
            const row = Math.floor(pos / cols);
            const col = pos % cols;
            const offsets = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]];
            const vecinos = [];
            for (const [dr, dc] of offsets) {
                const nr = row + dr, nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    const idx = nr * cols + nc;
                    if (!usadas.has(idx)) vecinos.push(idx);
                }
            }
            vecinosPorEsquina.push(vecinos);
        }
        
        let agregados = 0;
        while (agregados < cantidad - posiciones.length) {
            for (const vecinos of vecinosPorEsquina) {
                if (agregados >= cantidad - posiciones.length) break;
                for (const v of vecinos) {
                    if (!usadas.has(v) && agregados < cantidad - posiciones.length) {
                        posiciones.push(v);
                        usadas.add(v);
                        agregados++;
                    }
                }
            }
            if (agregados === 0) break;
        }
    }
    
    return posiciones.slice(0, cantidad);
}

function obtenerPosicionesMarco(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    const posiciones = [];
    const usadas = new Set();
    
    for (let c = 0; c < cols && posiciones.length < cantidad; c++) {
        const pos = c;
        if (!usadas.has(pos)) { posiciones.push(pos); usadas.add(pos); }
    }
    for (let c = cols - 1; c >= 0 && posiciones.length < cantidad; c--) {
        const pos = (rows - 1) * cols + c;
        if (!usadas.has(pos)) { posiciones.push(pos); usadas.add(pos); }
    }
    for (let r = 1; r < rows - 1 && posiciones.length < cantidad; r++) {
        const pos = r * cols;
        if (!usadas.has(pos)) { posiciones.push(pos); usadas.add(pos); }
    }
    for (let r = rows - 2; r >= 1 && posiciones.length < cantidad; r--) {
        const pos = r * cols + cols - 1;
        if (!usadas.has(pos)) { posiciones.push(pos); usadas.add(pos); }
    }
    
    if (posiciones.length < cantidad) {
        const internas = [];
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                const pos = r * cols + c;
                if (!usadas.has(pos)) internas.push(pos);
            }
        }
        internas.sort((a, b) => {
            const ra = Math.floor(a / cols), ca = a % cols;
            const rb = Math.floor(b / cols), cb = b % cols;
            const distA = Math.min(ra, rows - 1 - ra, ca, cols - 1 - ca);
            const distB = Math.min(rb, rows - 1 - rb, cb, cols - 1 - cb);
            return distA - distB;
        });
        posiciones.push(...internas.slice(0, cantidad - posiciones.length));
    }
    
    return posiciones.slice(0, cantidad);
}

function getColumnasGrid(grid) {
    const mapa = { '4x4': 4, '5x5': 5, 'pocitos4': 2, 'pocitos3': 2, 'cruzadas': 4 };
    return mapa[grid] || 4;
}

function getFilasGrid(grid) {
    const mapa = { '4x4': 4, '5x5': 5, 'pocitos4': 2, 'pocitos3': 2, 'cruzadas': 4 };
    return mapa[grid] || 4;
}
function distribuirFavoritasPorTablas(favoritas, totalTablas, maxPorTabla) {
    const resultado = [];
    if (favoritas.length === 0 || totalTablas === 0) return resultado;
    
    // Si solo 1 tabla, usar todas (limitado)
    if (totalTablas === 1) {
        resultado.push(favoritas.slice(0, Math.min(favoritas.length, maxPorTabla)));
        return resultado;
    }
    
    // Distribuir equitativamente
    const base = Math.floor(favoritas.length / totalTablas);
    const resto = favoritas.length % totalTablas;
    let index = 0;
    
    for (let i = 0; i < totalTablas; i++) {
        let cantidad = base + (i < resto ? 1 : 0);
        cantidad = Math.min(cantidad, maxPorTabla);
        resultado.push(favoritas.slice(index, index + cantidad));
        index += cantidad;
    }
    
    return resultado;
}

    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(sincronizarPais, 100);
    setTimeout(detectarGTranslate, 300);

    setTimeout(() => {
        if (JuguemosState.mode === 'dobles' && typeof window.DoblesManager !== 'undefined') {
            window.DoblesManager.init();
        }
    }, 400);
});
