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
            
            // 🔥 LIMPIAR posiciones dobles si NO es modo dobles
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
                // ✅ SIMPLIFICADO: Solo llamar a actualizarCasillas
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
        
        // 🔥 Si el modo NO es dobles, limpiar posiciones dobles
        if (JuguemosState.mode !== 'dobles') {
            JuguemosState.posicionesDobles = [];
            JuguemosState.cartasDobles = [];
            JuguemosState.asignacionDobles = {};
        }
        
        // 🔥 REFRESCAR VISTA PREVIA DE DOBLES SOLO SI ESTÁ ACTIVO
        if (JuguemosState.mode === 'dobles' && typeof window.DoblesManager !== 'undefined') {
            setTimeout(() => {
                window.DoblesManager.refreshPreview();
                drawGrid();
            }, 50);
        }
        
        setTimeout(llenarCasillasAutomatico, 200);
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
        });
    });

    // ========== TABLAS POR HOJA ==========
    const tablesPerPageInput = document.getElementById("j-tables-per-page");
    if (tablesPerPageInput) {
        const updateTables = () => {
            JuguemosState.quantity = parseInt(tablesPerPageInput.value) || 1;
            updateOrderSummary();
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
            updateOrderSummary();
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
    document.querySelectorAll(".j-color-swatch").forEach(swatch => {
        swatch.addEventListener("click", () => {
            document.querySelectorAll(".j-color-swatch").forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            JuguemosState.marcoColor = swatch.dataset.color;
            aplicarColores();
        });
    });

    document.querySelectorAll(".j-fondo-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".j-fondo-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            card.querySelector('input[type="radio"]').checked = true;
            JuguemosState.fondoColor = card.dataset.color;
            aplicarColores();
        });
    });

    aplicarColores();
    updateOrderSummary();

    // ========== TOGGLE INCLUIR BARAJAS ==========
    const btnIncluir = document.getElementById("j-incluir-barajas");
    const toggleIcon = document.getElementById("j-toggle-icon");
    if (btnIncluir) {
        const setActive = (active) => {
            JuguemosState.barajasIncluidas = active;
            btnIncluir.classList.toggle("active", active);
            toggleIcon.src =
                `/wp-content/uploads/2026/07/incluir_${active ? "on" : "off"}.png`;
            updateOrderSummary();
            if (typeof PrintPaper !== "undefined") {
                setTimeout(() => PrintPaper.refresh(), 150);
            }
        };
        setActive(true);
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
            const isActive = this.classList.toggle('active');
            if (isActive) {
                this.textContent = 'Selección Aleatoria';
                this.classList.remove('inactive');
                this.classList.add('active');

                if (!JuguemosState.deck) {
                    alert('Primero selecciona un diseño.');
                    this.classList.remove('active');
                    this.classList.add('inactive');
                    this.textContent = 'Selección Aleatoria';
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
            } else {
                this.textContent = 'Selección Aleatoria';
                this.classList.remove('active');
                this.classList.add('inactive');
                limpiarCasillas();
            }
        });
    }

    limpiarCasillas();
    drawMarcosPreview();

   // ========== SIGUIENTE: VISTA PREVIA ==========
    document.getElementById("j-go-preview")?.addEventListener("click", () => {
    
    // 🔥 VALIDACIÓN PARA MODO LIBRE
    if (JuguemosState.mode === 'libre') {
        const count = JuguemosState.libreImagesCount || 0;
        if (count < 54) {
            alert('Debes subir las 54 imágenes personalizadas antes de continuar.');
            return;
        }
    }
    
    // 🔥 NUEVO: VALIDACIÓN PARA MODO FAVORITAS
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

    // 🔥 NUEVO: VALIDACIÓN PARA MODO DOBLES (opcional)
    if (JuguemosState.mode === 'dobles') {
        const cartasDobles = JuguemosState.cartasDobles || [];
        if (cartasDobles.length === 0) {
            alert('No se generaron cartas dobles. Intenta nuevamente.');
            return;
        }
        console.log('Cartas dobles generadas:', cartasDobles.length);
    }

    // 🔥 NUEVO: VALIDACIÓN GENERAL - Que haya un diseño seleccionado
    if (!JuguemosState.deck) {
        alert('Selecciona un diseño de lotería primero.');
        return;
    }

    // 🔥 NUEVO: VALIDACIÓN - Que haya barajas cargadas
    if (!JuguemosState.barajas || JuguemosState.barajas.length === 0) {
        alert('No se cargaron las barajas. Intenta seleccionar otro diseño.');
        return;
    }

    // ✅ Todo validado, proceder
    if (typeof llenarCasillasAutomatico === 'function') llenarCasillasAutomatico();
    regenerarTodasLasTablas();
    updateOrderSummary();
    document.querySelectorAll(".j-step").forEach(s => s.classList.remove("active"));
    document.getElementById("j-tables-per-page").value = JuguemosState.quantity;
    document.getElementById("juguemos-preview-completo").classList.add("active");
    document.querySelectorAll(".juguemos-step").forEach(s => s.classList.remove("active"));
    document.querySelector('.juguemos-step[data-step="3"]')?.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
    PrintPaper.refresh();

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
        JuguemosAjax.loadPrice(JuguemosState.country, JuguemosState.mode, JuguemosState.quantity);
    }
}

function updatePaperOptions() {
    const select = document.getElementById("j-paper-size");
    if (!select) return;
    const isMexico = JuguemosState.country === "Mexico";
    select.innerHTML = isMexico ? `
        <option value="carta">Carta (21.59 × 27.94 cm)</option>
        <option value="oficio">Oficio (21.59 × 33.02 cm)</option>
        <option value="a4">A4 (21 × 29.7 cm)</option>
    ` : `
        <option value="letter">Letter (8.5 × 11 in)</option>
        <option value="legal">Legal (8.5 × 14 in)</option>
        <option value="a4">A4 (8.27 × 11.69 in)</option>
    `;
    select.selectedIndex = 0;
    JuguemosState.paper = select.value;
}

function drawGrid() {
    const grid = JuguemosState.grid || '4x4';
    const container = document.getElementById('j-grid-preview');
    if (!container) return;
    
    container.dataset.grid = grid;
    let cells;
    let cols, rows;
    
    if (grid === 'pocitos4') {
        cells = 4;
        cols = 2;
        rows = 2;
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else if (grid === 'pocitos3') {
        cells = 3;
        cols = 2;
        rows = 2;
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else if (grid === 'cruzadas') {
        cells = 8;
        cols = 4;
        rows = 4;
        container.style.gridTemplateColumns = 'repeat(4, 1fr)';
        container.style.gridTemplateRows = 'repeat(4, 1fr)';
    } else {
        cols = grid === '5x5' ? 5 : 4;
        rows = grid === '5x5' ? 5 : 4;
        cells = cols * rows;
        container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    }
    
    // 🔥 Si es modo dobles, usar las posiciones de DoblesManager
    const esModoDobles = JuguemosState.mode === 'dobles';
    let posicionesDobles = [];
    
    if (esModoDobles && typeof window.DoblesManager !== 'undefined') {
        posicionesDobles = window.DoblesManager.getPosicionesDobles() || [];
    }
    
    // Si no hay posiciones dobles, usar las del estado global
    if (posicionesDobles.length === 0 && esModoDobles) {
        posicionesDobles = JuguemosState.posicionesDobles || [];
    }
    
    let html = '';
    for (let i = 0; i < cells; i++) {
        const esDoble = esModoDobles && posicionesDobles.includes(i);
        html += `<div class="cell ${esDoble ? 'doble-ubicacion' : ''}">
            ${esDoble ? '<img src="/wp-content/uploads/2026/08/doblesx2.png" class="j-doble-imagen" alt="×2" loading="lazy">' : ''}
        </div>`;
    }
    
    container.innerHTML = html;
}

function getTotalCasillas(grid) {
    return { '4x4': 16, '5x5': 25, 'pocitos4': 4, 'pocitos3': 3, 'cruzadas': 8 }[grid] || 16;
}

function llenarCasillasAleatorio() {
    if (!JuguemosState.deck) { alert('Primero selecciona un diseño.'); return; }
    if (!JuguemosState.barajas?.length) { alert('No hay barajas disponibles para este diseño.'); return; }
    ejecutarLlenadoAleatorio();
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
    } else {
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
    }
    
    // 🔥 OBTENER FAVORITAS
    const favoritas = JuguemosState.favoritas || [];
    const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';
    
    // 🔥 OBTENER CARTAS DOBLES - SOLO DE LA PRIMERA TABLA
    const esModoDobles = JuguemosState.mode === 'dobles';
    
    // 🔥 🔥 🔥 CORRECCIÓN: Solo usar las cartas dobles de la PRIMERA tabla
    let cartasDoblesPrimeraTabla = [];
    if (esModoDobles && JuguemosState.asignacionDobles && JuguemosState.asignacionDobles[0]) {
        // Obtener las cartas dobles de la primera tabla (índice 0)
        const asignacionPrimeraTabla = JuguemosState.asignacionDobles[0];
        if (asignacionPrimeraTabla) {
            const numerosDobles = Object.keys(asignacionPrimeraTabla).map(Number);
            cartasDoblesPrimeraTabla = numerosDobles;
        }
    }
    
    // Si no hay asignación por tabla, usar el método antiguo (fallback)
    if (cartasDoblesPrimeraTabla.length === 0 && esModoDobles) {
        const cartasDobles = JuguemosState.cartasDobles || [];
        // Si cartasDobles tiene más de 1, solo tomar la primera
        const primeraCarta = cartasDobles.length > 0 ? cartasDobles[0] : null;
        if (primeraCarta) {
            cartasDoblesPrimeraTabla = [parseInt(primeraCarta.numero)];
        }
    }
    
    // Si no hay casillas, mostrar vacío
    if (!casillas || casillas.length === 0) {
        const total = getTotalCasillas(grid);
        container.innerHTML = Array(total).fill('<div class="cell empty"></div>').join('');
        return;
    }
    
    // Mostrar las casillas con los badges correspondientes
    container.innerHTML = casillas.map((casilla, index) => {
        const esFavorita = tieneFavoritas && favoritas.some(f => f && parseInt(f.numero) === casilla?.numero);
        const esDoble = esModoDobles && casilla && cartasDoblesPrimeraTabla.includes(parseInt(casilla.numero));
        const claseExtra = esFavorita ? ' favorita' : (esDoble ? ' doble' : '');
        
        if (casilla) {
            return `
                <div class="cell${claseExtra}" data-index="${index}" title="${casilla.nombre || ''}${esFavorita ? ' ⭐ Favorita' : ''}${esDoble ? ' ×2 Doble' : ''}">
                    <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                    ${esFavorita ? '<span class="j-favorita-badge">⭐</span>' : ''}
                    ${esDoble ? '<span class="j-doble-badge">×2</span>' : ''}
                </div>
            `;
        } else {
            return `<div class="cell empty" data-index="${index}"></div>`;
        }
    }).join('');
    
    JuguemosState.casillasAsignadas = casillas;
}

function limpiarCasillas() {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    
    // 🔥 Si es Pocitos 4, usar 2x2
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
}

function aplicarColores() {
    document.documentElement.style.setProperty('--j-marco-color', JuguemosState.marcoColor || '#FA299C');
    document.documentElement.style.setProperty('--j-fondo-color', JuguemosState.fondoColor || '#FFFFFF');
}

function drawMarcosPreview() {
    const container = document.getElementById('j-marcos-preview-grid');
    if (!container) return;
    
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    
    // 🔥 Si es Pocitos 4, usar 2x2
    if (grid === 'pocitos4') {
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
    }
    
    const total = getTotalCasillas(grid);
    container.innerHTML = Array(total).fill('<div class="cell"></div>').join('');
}

function updateOrderSummary() {
    const total = JuguemosState.total || 0;
    const currency = JuguemosState.currency || 'USD';
    const country = JuguemosState.country || 'Mexico';
    const mode = JuguemosState.mode || 'sencilla';
    const quantity = JuguemosState.quantity || 0;
    const modeLabel = mode === 'favoritas' ? 'Favoritas' : mode;
    const priceText = '$' + Number(total).toFixed(2) + ' ' + currency;
    
    // 🔥 Obtener ubicación de favoritas
    const ubicacionLabels = {
        'aleatoria': 'Aleatoria',
        'centro': 'Centro',
        'esquinas': 'Esquinas',
        'marco': 'Marco'
    };
    const ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
    const ubicacionLabel = mode === 'favoritas' ? ubicacionLabels[ubicacion] || 'Aleatoria' : '';

    const elementos = {
        'payment-summary-country': country,
        'payment-summary-mode': modeLabel,
        'payment-summary-quantity': quantity,
        'payment-summary-price': priceText,
        'summary-country': country,
        'summary-mode': modeLabel,
        'summary-quantity': quantity,
        'summary-price': priceText,
        'j-summary-tables': `${quantity} tablas por hoja`,
        'j-summary-cards': JuguemosState.mode === 'libre' 
        ? (JuguemosState.libreImagesCount === 54 
            ? '54 barajas' 
            : `${JuguemosState.libreImagesCount || 0}/54 barajas`)
        : `${JuguemosState.barajas?.length || 0} barajas`,
        'j-summary-paper': JuguemosState.paper,
        'j-summary-orientation': JuguemosState.orientation === "vertical" ? "Vertical" : "Horizontal",
        'j-summary-pages': `${JuguemosState.pages} páginas`,
        'j-summary-grid': { "4x4": "4x4 · 16 casillas", "5x5": "5x5 · 25 casillas", "pocitos4": "Pocitos 4", "pocitos3": "Pocitos 3", "cruzadas": "Cruzadas · 8 casillas" }[JuguemosState.grid] || "4x4 · 16 casillas",
        'j-summary-mode': modeLabel,
        'j-summary-cutmarks': JuguemosState.cutMarks ? "Líneas de corte" : "Sin líneas de corte",
        'j-summary-libre': JuguemosState.mode === 'libre' ? 
            (JuguemosState.libreImagesCount === 54 ? 'Completo (54/54)' : `${JuguemosState.libreImagesCount || 0}/54 imagenes`) : 'No aplica',
        'j-summary-ubicacion': mode === 'favoritas' ? `Ubicación: ${ubicacionLabel}` : ''
    };
    

    Object.keys(elementos).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = elementos[id];
    });
}
function regenerarTodasLasTablas() { llenarCasillasAleatorio(); }

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
    
    // 🔥 SINCORONIZAR FAVORITAS DESDE EL MANAGER
    if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
        // ✅ USAR MÉTODOS PÚBLICOS DEL MANAGER
        const favoritasDelManager = window.FavoritasManagerInstance.getFavoritas();
        const ubicacionDelManager = window.FavoritasManagerInstance.getUbicacion();
        
        // Solo actualizar si hay cambios
        if (favoritasDelManager.length > 0) {
            JuguemosState.favoritas = favoritasDelManager;
            JuguemosState.favoritasUbicacion = ubicacionDelManager;
            console.log('🔄 Sincronizadas favoritas desde manager:', {
                count: favoritasDelManager.length,
                ubicacion: ubicacionDelManager,
                nombres: favoritasDelManager.map(f => f.nombre)
            });
        }
    }
    
    // 🔥 Si no es modo dobles, limpiar posiciones dobles
    if (JuguemosState.mode !== 'dobles') {
        JuguemosState.posicionesDobles = [];
        JuguemosState.cartasDobles = [];
        JuguemosState.asignacionDobles = {};
        drawGrid();
    }
    
    if (!JuguemosState.barajas?.length) {
        JuguemosAjax.loadBarajas(JuguemosState.deck).then(() => {
            if (JuguemosState.barajas.length > 0) ejecutarLlenadoAleatorio();
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

    console.log('🔄 ejecutarLlenadoAleatorio - Iniciando:', {
        modo: JuguemosState.mode,
        grid: grid,
        totalCasillas: totalCasillas,
        totalTablas: totalTablas,
        barajas: JuguemosState.barajas.length
    });

    const todasLasTablas = [];
    const todasLasBarajas = [...JuguemosState.barajas];
    
    // 🔥 🔥 🔥 SINCRONIZAR FAVORITAS DESDE EL MANAGER (CRÍTICO)
    let favoritas = [];
    let ubicacion = 'aleatoria';
    let tieneFavoritas = false;
    
    if (JuguemosState.mode === 'favoritas') {
        // ✅ PRIMERO: Intentar desde el manager
        if (window.FavoritasManagerInstance) {
            const favoritasDelManager = window.FavoritasManagerInstance.getFavoritas();
            const ubicacionDelManager = window.FavoritasManagerInstance.getUbicacion();
            
            if (favoritasDelManager && favoritasDelManager.length > 0) {
                favoritas = favoritasDelManager;
                ubicacion = ubicacionDelManager;
                tieneFavoritas = true;
                
                // ✅ Actualizar el estado global
                JuguemosState.favoritas = favoritas;
                JuguemosState.favoritasUbicacion = ubicacion;
                
                console.log('✅ Favoritas sincronizadas desde manager:', {
                    count: favoritas.length,
                    ubicacion: ubicacion,
                    nombres: favoritas.map(f => f.nombre)
                });
            }
        }
        
        // ✅ SEGUNDO: Si no hay del manager, usar el estado global
        if (!tieneFavoritas) {
            const favoritasEstado = JuguemosState.favoritas || [];
            if (favoritasEstado.length > 0) {
                favoritas = favoritasEstado;
                ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
                tieneFavoritas = true;
                console.log('✅ Favoritas desde estado global:', favoritas.length);
            }
        }
        
        // ✅ TERCERO: Si no hay favoritas, mostrar advertencia
        if (!tieneFavoritas || favoritas.length === 0) {
            console.warn('No hay favoritas seleccionadas en modo Favoritas');
            // No detenemos la ejecución, solo mostramos advertencia
        }
    }

    // 🔥 CONFIGURACIÓN DE DOBLES
    let configDoblesPorTabla = [];
    if (JuguemosState.mode === 'dobles' && typeof window.DoblesManager !== 'undefined') {
        const posiciones = window.DoblesManager.obtenerPosicionesPorUbicacion(grid, 2);
        JuguemosState.posicionesDobles = posiciones;
        
        for (let t = 0; t < totalTablas; t++) {
            const barajasMezcladas = [...todasLasBarajas];
            for (let i = barajasMezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [barajasMezcladas[i], barajasMezcladas[j]] = [barajasMezcladas[j], barajasMezcladas[i]];
            }
            
            const cartaDoble = barajasMezcladas[0];
            
            configDoblesPorTabla.push({
                carta: cartaDoble,
                posiciones: posiciones,
                asignacion: {
                    [cartaDoble.numero]: posiciones
                }
            });
        }
        
        JuguemosState.cartasDobles = configDoblesPorTabla.map(c => c.carta);
        JuguemosState.asignacionDobles = configDoblesPorTabla.reduce((acc, c, idx) => {
            acc[idx] = c.asignacion;
            return acc;
        }, {});
        
        drawGrid();
    }

    // 🔥 GENERAR CADA TABLA
    for (let t = 0; t < totalTablas; t++) {
        const casillas = new Array(totalCasillas).fill(null);
        const copiaBarajas = [...todasLasBarajas];
        
        // 🔥 COLOCAR FAVORITAS (PRIMERO, para que tengan prioridad)
        if (tieneFavoritas && favoritas.length > 0) {
            // Distribuir favoritas entre tablas
            const favoritasPorTabla = distribuirFavoritasPorTablas(favoritas, totalTablas, totalCasillas);
            const favoritasTabla = favoritasPorTabla[t] || [];
            
            if (favoritasTabla.length > 0) {
                // Obtener posiciones según la ubicación
                const posicionesFavoritas = obtenerPosicionesFavoritas(grid, favoritasTabla.length, ubicacion);
                
                console.log(`📊 Tabla ${t + 1}: ${favoritasTabla.length} favoritas en posiciones:`, posicionesFavoritas);
                
                favoritasTabla.forEach((favorita, idx) => {
                    const pos = posicionesFavoritas[idx] !== undefined ? posicionesFavoritas[idx] : idx;
                    if (pos < totalCasillas && !casillas[pos]) {
                        casillas[pos] = favorita;
                        // Remover de la copia de barajas para no repetir
                        const indexEnCopia = copiaBarajas.findIndex(b => b.numero === favorita.numero);
                        if (indexEnCopia !== -1) {
                            copiaBarajas.splice(indexEnCopia, 1);
                        }
                    }
                });
            }
        }
        
        // 🔥 COLOCAR DOBLES (DESPUÉS de favoritas)
        if (configDoblesPorTabla.length > 0 && configDoblesPorTabla[t]) {
            const config = configDoblesPorTabla[t];
            const asignacion = config.asignacion;
            
            Object.keys(asignacion).forEach(numeroCarta => {
                const posiciones = asignacion[numeroCarta];
                const carta = todasLasBarajas.find(b => b.numero == numeroCarta);
                
                if (carta && posiciones && posiciones.length === 2) {
                    // Verificar que las posiciones no estén ocupadas por favoritas
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
        
        // 🔥 LLENAR RESTO CON BARAJAS ALEATORIAS
        for (let i = 0; i < totalCasillas; i++) {
            if (!casillas[i]) {
                let baraja = null;
                let intentos = 0;
                
                // Intentar encontrar una baraja que no sea favorita ni doble
                while (!baraja && intentos < 50 && copiaBarajas.length > 0) {
                    const idx = Math.floor(Math.random() * copiaBarajas.length);
                    const candidata = copiaBarajas[idx];
                    
                    // Verificar que no sea favorita
                    const esFavorita = tieneFavoritas && favoritas.some(f => f.numero === candidata.numero);
                    // Verificar que no sea doble
                    const esDoble = configDoblesPorTabla[t]?.carta?.numero == candidata.numero;
                    
                    if (!esFavorita && !esDoble) {
                        baraja = copiaBarajas.splice(idx, 1)[0];
                    } else {
                        // Si es favorita o doble, mover al final y seguir buscando
                        copiaBarajas.push(copiaBarajas.splice(idx, 1)[0]);
                    }
                    intentos++;
                }
                
                // Si no se encontró, usar cualquier baraja
                if (!baraja && copiaBarajas.length > 0) {
                    baraja = copiaBarajas.pop();
                }
                
                // Fallback: usar baraja aleatoria del total
                if (!baraja) {
                    baraja = todasLasBarajas[Math.floor(Math.random() * todasLasBarajas.length)];
                }
                
                casillas[i] = baraja;
            }
        }
        
        todasLasTablas.push(casillas);
    }

    // ✅ GUARDAR EN EL ESTADO GLOBAL
    JuguemosState.todasLasTablas = todasLasTablas;
    
    if (todasLasTablas.length > 0) {
        const tablaMostrar = todasLasTablas[0];
        JuguemosState.casillasAsignadas = tablaMostrar;
        actualizarPreviewCasillas(tablaMostrar);
        
        console.log('✅ Tablas generadas:', {
            totalTablas: todasLasTablas.length,
            primeraTabla: tablaMostrar.map(c => c?.nombre || 'vacío'),
            favoritas: favoritas.length,
            modo: JuguemosState.mode
        });
    } else {
        console.warn('No se generaron tablas');
    }
}
// =========================================================
// FUNCIÓN PARA OBTENER POSICIONES DE FAVORITAS
// =========================================================

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

// =========================================================
// FUNCIONES DE POSICIONAMIENTO
// =========================================================

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

// =========================================================
// PROTECCIÓN
// =========================================================
/*     document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault()); */

// =========================================================
// INICIALIZACIÓN FINAL
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(sincronizarPais, 100);
    setTimeout(detectarGTranslate, 300);

    setTimeout(() => {
        if (JuguemosState.mode === 'dobles' && typeof window.DoblesManager !== 'undefined') {
            window.DoblesManager.init();
        }
    }, 400);
});
