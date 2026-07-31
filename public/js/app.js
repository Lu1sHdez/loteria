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
            
            // Mostrar según modo
            if (mode === 'libre') {
                if (libreUpload) libreUpload.style.display = 'block';
            } else if (mode === 'dobles') {
                if (doblesOption) doblesOption.style.display = '';
            } else if (mode === 'favoritas') {
                if (favoritasOption) favoritasOption.style.display = '';
                // Inicializar Favoritas
                if (window.FavoritasManagerInstance) {
                    setTimeout(() => {
                        window.FavoritasManagerInstance.renderGrid();
                        window.FavoritasManagerInstance.renderSeleccionadas();
                    }, 100);
                }
            } else {
                // Modo sencilla (por defecto)
                if (aleatoriaOption) aleatoriaOption.style.display = '';
            }
            
            actualizarYRegenerar(llenarCasillasAutomatico);
        });
    });
    // ========== GRID ==========
    const handleGridChange = () => {
        drawGrid();
        drawMarcosPreview();
        limpiarCasillas();
        updateOrderSummary();
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
        // Validación para modo Libre
        if (JuguemosState.mode === 'libre') {
            const count = JuguemosState.libreImagesCount || 0;
            if (count < 54) {
                alert('Debes subir las 54 imágenes personalizadas antes de continuar.');
                return; // Detiene la ejecución
            }
        }

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
    if (grid === 'pocitos4') {
        cells = 4;
        container.style.gridTemplateColumns = 'repeat(2, 1fr)';
        container.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
        cells = { '4x4': 16, '5x5': 25, 'pocitos4': 4, 'pocitos3': 3, 'cruzadas': 8 }[grid] || 16;
        container.style.gridTemplateColumns = '';
        container.style.gridTemplateRows = '';
    }
    
    container.innerHTML = Array(cells).fill('<div class="cell"></div>').join('');
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
    
    // 🔥 OBTENER FAVORITAS PARA SABER QUÉ CASILLAS RESALTAR
    const favoritas = JuguemosState.favoritas || [];
    const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';
    
    // Si no hay casillas, mostrar vacío
    if (!casillas || casillas.length === 0) {
        const total = getTotalCasillas(grid);
        container.innerHTML = Array(total).fill('<div class="cell empty"></div>').join('');
        return;
    }
    
    // Mostrar las casillas respetando el orden (que ya incluye la ubicación)
    container.innerHTML = casillas.map((casilla, index) => {
        const esFavorita = tieneFavoritas && favoritas.some(f => f && f.numero === casilla?.numero);
        const claseExtra = esFavorita ? ' favorita' : '';
        
        if (casilla) {
            return `
                <div class="cell${claseExtra}" data-index="${index}" title="${casilla.nombre || ''}${esFavorita ? ' ⭐ Favorita' : ''}">
                    <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                    ${esFavorita ? '<span class="j-favorita-badge">⭐</span>' : ''}
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

// =========================================================
// LLENADO AUTOMÁTICO
// =========================================================
function llenarCasillasAutomatico() {
    if (!JuguemosState.deck) return;
    if (!JuguemosState.barajas?.length) {
        JuguemosAjax.loadBarajas(JuguemosState.deck).then(() => {
            if (JuguemosState.barajas.length > 0) ejecutarLlenadoAleatorio();
        });
        return;
    }
    ejecutarLlenadoAleatorio();
}

function ejecutarLlenadoAleatorio() {
    if (!JuguemosState.barajas?.length) return;
    
    const grid = JuguemosState.grid || '4x4';
    const totalCasillas = getTotalCasillas(grid);
    const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
    
    if (!totalCasillas) return;

    const todasLasTablas = [];
    const todasLasBarajas = [...JuguemosState.barajas];
    
    // 🔥 OBTENER FAVORITAS
    const favoritas = JuguemosState.favoritas || [];
    const ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
    const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';

    // 🔥 DISTRIBUIR FAVORITAS ENTRE TABLAS
    let favoritasPorTabla = [];
    if (tieneFavoritas) {
        favoritasPorTabla = distribuirFavoritas(favoritas, totalTablas, totalCasillas);
    }

    for (let t = 0; t < totalTablas; t++) {
        const favoritasTabla = favoritasPorTabla[t] || [];
        
        // Mezclar barajas disponibles
        const mezcladas = [...todasLasBarajas];
        for (let i = mezcladas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
        }
        
        const casillas = new Array(totalCasillas).fill(null);
        const copiaBarajas = [...mezcladas];
        
        // 🔥 Si hay favoritas, colocarlas según ubicación
        if (favoritasTabla.length > 0) {
            // Obtener posiciones según ubicación
            const posiciones = obtenerPosicionesUbicacion(grid, favoritasTabla.length, ubicacion);
            console.log(`📍 Tabla ${t+1}: Ubicación "${ubicacion}", Favoritas: ${favoritasTabla.length}, Posiciones:`, posiciones);
            
            // Colocar favoritas en sus posiciones
            favoritasTabla.forEach((favorita, idx) => {
                const pos = posiciones[idx] !== undefined ? posiciones[idx] : idx;
                if (pos < totalCasillas) {
                    casillas[pos] = favorita;
                    // Remover la favorita de la copia para no repetirla
                    const indexEnCopia = copiaBarajas.findIndex(b => b.numero === favorita.numero);
                    if (indexEnCopia !== -1) {
                        copiaBarajas.splice(indexEnCopia, 1);
                    }
                }
            });
            
            // Llenar el resto con barajas aleatorias (NO favoritas)
            for (let i = 0; i < totalCasillas; i++) {
                if (!casillas[i]) {
                    let baraja = null;
                    let intentos = 0;
                    while (!baraja && intentos < 50 && copiaBarajas.length > 0) {
                        const idx = Math.floor(Math.random() * copiaBarajas.length);
                        const candidata = copiaBarajas[idx];
                        // Verificar que NO sea favorita
                        const esFavoritaEnTabla = favoritasTabla.some(f => f.numero === candidata.numero);
                        if (!esFavoritaEnTabla) {
                            baraja = copiaBarajas.splice(idx, 1)[0];
                        } else {
                            // Mover al final para intentar otra
                            copiaBarajas.push(copiaBarajas.splice(idx, 1)[0]);
                        }
                        intentos++;
                    }
                    
                    // Si no encontramos, usar cualquier baraja
                    if (!baraja && copiaBarajas.length > 0) {
                        baraja = copiaBarajas.pop();
                    }
                    
                    // Fallback final
                    if (!baraja) {
                        baraja = mezcladas[Math.floor(Math.random() * mezcladas.length)];
                    }
                    
                    casillas[i] = baraja;
                }
            }
        } else {
            // Sin favoritas: llenado aleatorio normal
            const copia = [...mezcladas];
            for (let i = 0; i < totalCasillas; i++) {
                if (copia.length) {
                    const idx = Math.floor(Math.random() * copia.length);
                    casillas[i] = copia.splice(idx, 1)[0];
                } else {
                    casillas[i] = mezcladas[Math.floor(Math.random() * mezcladas.length)];
                }
            }
        }
        
        todasLasTablas.push(casillas);
    }

    JuguemosState.todasLasTablas = todasLasTablas;
    
    // 🔥 ACTUALIZAR VISTA PREVIA - Mostrar la primera tabla
    if (todasLasTablas.length > 0) {
        const tablaMostrar = todasLasTablas[0];
        JuguemosState.casillasAsignadas = tablaMostrar;
        actualizarPreviewCasillas(tablaMostrar);
    }
}

// =========================================================
// FUNCIONES DE DISTRIBUCIÓN DE FAVORITAS (MEJORADAS)
// =========================================================

function distribuirFavoritas(favoritas, totalTablas, maxPorTabla) {
    const totalFavoritas = favoritas.length;
    const favoritasPorTabla = [];
    
    if (totalFavoritas === 0 || totalTablas === 0) return favoritasPorTabla;
    
    // Si solo hay 1 tabla, usar todas las favoritas (limitado por maxPorTabla)
    if (totalTablas === 1) {
        const cantidad = Math.min(totalFavoritas, maxPorTabla);
        favoritasPorTabla.push(favoritas.slice(0, cantidad));
        return favoritasPorTabla;
    }
    
    // Distribuir equitativamente entre tablas
    const base = Math.floor(totalFavoritas / totalTablas);
    const resto = totalFavoritas % totalTablas;
    
    let index = 0;
    for (let i = 0; i < totalTablas; i++) {
        let cantidad = base + (i < resto ? 1 : 0);
        // No exceder el máximo de casillas por tabla
        cantidad = Math.min(cantidad, maxPorTabla);
        const slice = favoritas.slice(index, index + cantidad);
        favoritasPorTabla.push(slice);
        index += cantidad;
    }
    
    // Si sobraron favoritas (porque se excedió maxPorTabla), agregarlas a la última tabla
    if (index < totalFavoritas) {
        const sobrantes = favoritas.slice(index);
        const ultimaTabla = favoritasPorTabla[favoritasPorTabla.length - 1] || [];
        const espacioRestante = maxPorTabla - ultimaTabla.length;
        const agregar = Math.min(sobrantes.length, espacioRestante);
        if (agregar > 0) {
            favoritasPorTabla[favoritasPorTabla.length - 1] = ultimaTabla.concat(sobrantes.slice(0, agregar));
        }
    }
    
    return favoritasPorTabla;
}

// =========================================================
// FUNCIONES DE UBICACIÓN - VERSIÓN GENÉRICA
// =========================================================

function obtenerPosicionesUbicacion(grid, cantidad, ubicacion) {
    const total = getTotalCasillas(grid);
    const cantidadReal = Math.min(cantidad, total);
    
    console.log('📍 Ubicación:', ubicacion, 'Cantidad:', cantidadReal, 'Grid:', grid, 'Total casillas:', total);
    
    // Si no hay favoritas o la cantidad es 0
    if (cantidadReal === 0) return [];
    
    // Si la cantidad es igual o mayor al total, devolver todas las posiciones
    if (cantidadReal >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    switch (ubicacion) {
        case 'centro':
            return obtenerCentro(grid, cantidadReal);
        case 'esquinas':
            return obtenerEsquinas(grid, cantidadReal);
        case 'marco':
            return obtenerMarco(grid, cantidadReal);
        case 'aleatoria':
        default:
            return obtenerAleatorio(grid, cantidadReal);
    }
}

// =========================================================
// CENTRO - Expande desde el centro hacia afuera
// =========================================================
function obtenerCentro(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    // Calcular centro de la cuadrícula
    const centroCol = (cols - 1) / 2;
    const centroRow = (rows - 1) / 2;
    
    // Crear lista de posiciones ordenadas por distancia al centro
    const posiciones = [];
    const distanciaMap = new Map();
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const idx = r * cols + c;
            // Distancia euclidiana al centro
            const dist = Math.sqrt(Math.pow(r - centroRow, 2) + Math.pow(c - centroCol, 2));
            distanciaMap.set(idx, dist);
            posiciones.push(idx);
        }
    }
    
    // Ordenar por distancia al centro (más cercano primero)
    posiciones.sort((a, b) => distanciaMap.get(a) - distanciaMap.get(b));
    
    return posiciones.slice(0, cantidad);
}

// =========================================================
// ESQUINAS - Prioriza esquinas y luego expande hacia adentro
// =========================================================
function obtenerEsquinas(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    // Definir las 4 esquinas
    const esquinas = [
        0,                          // Superior izquierda
        cols - 1,                   // Superior derecha
        (rows - 1) * cols,          // Inferior izquierda
        (rows - 1) * cols + cols - 1 // Inferior derecha
    ];
    
    const posiciones = [];
    const usadas = new Set();
    
    // Primero agregar esquinas
    for (const pos of esquinas) {
        if (pos < total && !usadas.has(pos)) {
            posiciones.push(pos);
            usadas.add(pos);
            if (posiciones.length >= cantidad) return posiciones;
        }
    }
    
    // Si necesitamos más, expandir desde las esquinas hacia adentro (en espiral)
    if (posiciones.length < cantidad) {
        // Para cada esquina, obtener sus vecinos más cercanos
        const vecinosPorEsquina = [];
        for (const pos of esquinas) {
            if (pos >= total) continue;
            const row = Math.floor(pos / cols);
            const col = pos % cols;
            const vecinos = [];
            
            // Vecinos cercanos a la esquina (en orden de proximidad)
            const offsets = [
                [0, 1], [1, 0], [0, -1], [-1, 0],  // Ortogonales
                [1, 1], [1, -1], [-1, 1], [-1, -1] // Diagonales
            ];
            
            for (const [dr, dc] of offsets) {
                const nr = row + dr;
                const nc = col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    const idx = nr * cols + nc;
                    if (!usadas.has(idx)) {
                        vecinos.push(idx);
                    }
                }
            }
            vecinosPorEsquina.push(vecinos);
        }
        
        // Intercalar vecinos de todas las esquinas
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
            // Si no hay más vecinos, salir
            if (agregados === 0) break;
        }
    }
    
    return posiciones.slice(0, cantidad);
}

// =========================================================
// MARCO - Borde completo de la cuadrícula
// =========================================================
function obtenerMarco(grid, cantidad) {
    const cols = getColumnasGrid(grid);
    const rows = getFilasGrid(grid);
    const total = cols * rows;
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    const marco = [];
    const usadas = new Set();
    
    // 1. Primera fila (arriba) - de izquierda a derecha
    for (let c = 0; c < cols && marco.length < cantidad; c++) {
        const pos = c;
        if (!usadas.has(pos)) {
            marco.push(pos);
            usadas.add(pos);
        }
    }
    
    // 2. Última fila (abajo) - de derecha a izquierda
    for (let c = cols - 1; c >= 0 && marco.length < cantidad; c--) {
        const pos = (rows - 1) * cols + c;
        if (!usadas.has(pos)) {
            marco.push(pos);
            usadas.add(pos);
        }
    }
    
    // 3. Columna izquierda (excepto esquinas ya agregadas)
    for (let r = 1; r < rows - 1 && marco.length < cantidad; r++) {
        const pos = r * cols;
        if (!usadas.has(pos)) {
            marco.push(pos);
            usadas.add(pos);
        }
    }
    
    // 4. Columna derecha (excepto esquinas ya agregadas)
    for (let r = rows - 2; r >= 1 && marco.length < cantidad; r--) {
        const pos = r * cols + cols - 1;
        if (!usadas.has(pos)) {
            marco.push(pos);
            usadas.add(pos);
        }
    }
    
    // Si aún faltan, llenar con posiciones internas (ordenadas desde el borde hacia adentro)
    if (marco.length < cantidad) {
        const internas = [];
        for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
                const pos = r * cols + c;
                if (!usadas.has(pos)) {
                    internas.push(pos);
                }
            }
        }
        // Ordenar internas por cercanía al borde
        internas.sort((a, b) => {
            const ra = Math.floor(a / cols);
            const ca = a % cols;
            const rb = Math.floor(b / cols);
            const cb = b % cols;
            const distA = Math.min(ra, rows - 1 - ra, ca, cols - 1 - ca);
            const distB = Math.min(rb, rows - 1 - rb, cb, cols - 1 - cb);
            return distA - distB;
        });
        
        const restantes = cantidad - marco.length;
        marco.push(...internas.slice(0, restantes));
    }
    
    return marco.slice(0, cantidad);
}

// =========================================================
// ALEATORIA - Posiciones aleatorias
// =========================================================
function obtenerAleatorio(grid, cantidad) {
    const total = getTotalCasillas(grid);
    
    if (cantidad >= total) {
        return Array.from({ length: total }, (_, i) => i);
    }
    
    const indices = Array.from({ length: total }, (_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, cantidad);
}

// =========================================================
// FUNCIONES AUXILIARES
// =========================================================
function getColumnasGrid(grid) {
    const mapa = {
        '4x4': 4,
        '5x5': 5,
        'pocitos4': 2,
        'pocitos3': 2,
        'cruzadas': 4
    };
    return mapa[grid] || 4;
}

function getFilasGrid(grid) {
    const mapa = {
        '4x4': 4,
        '5x5': 5,
        'pocitos4': 2,
        'pocitos3': 2,
        'cruzadas': 4
    };
    return mapa[grid] || 4;
}

    JuguemosState.todasLasTablas = todasLasTablas;
    if (todasLasTablas.length) {
        JuguemosState.casillasAsignadas = todasLasTablas[0];
        actualizarPreviewCasillas(todasLasTablas[0]);
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
});
