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
            JuguemosState.mode = button.dataset.mode;
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

    // ========== INCLUIR BARAJAS ==========
    const btnIncluir = document.getElementById("j-incluir-barajas");
    const statusMsg = document.getElementById("j-incluir-status");
    if (btnIncluir) {
        btnIncluir.classList.add('active');
        JuguemosState.barajasIncluidas = true;
        if (statusMsg) statusMsg.style.display = 'none';

        btnIncluir.addEventListener("click", function() {
            const isActive = this.classList.toggle('active');
            JuguemosState.barajasIncluidas = isActive;
            if (isActive) {
                this.classList.remove('inactive');
                this.innerHTML = 'Incluir barajas';
                if (statusMsg) statusMsg.style.display = 'none';
            } else {
                this.classList.add('inactive');
                this.innerHTML = 'No incluir barajas';
                if (statusMsg) {
                    statusMsg.textContent = 'Barajas no incluidas';
                    statusMsg.style.display = 'block';
                    statusMsg.className = 'j-incluir-status inactive';
                    statusMsg.style.color = '#898989';
                }
            }
            updateOrderSummary();
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
    const cells = { '4x4': 16, '5x5': 25, 'pocitos4': 4, 'pocitos3': 3, 'cruzadas': 5 }[grid] || 16;
    container.innerHTML = Array(cells).fill('<div class="cell"></div>').join('');
}

function getTotalCasillas(grid) {
    return { '4x4': 16, '5x5': 25, 'pocitos4': 4, 'pocitos3': 3, 'cruzadas': 5 }[grid] || 16;
}

function llenarCasillasAleatorio() {
    if (!JuguemosState.deck) { alert('Primero selecciona un diseño.'); return; }
    if (!JuguemosState.barajas?.length) { alert('No hay barajas disponibles para este diseño.'); return; }
    ejecutarLlenadoAleatorio();
}

function actualizarPreviewCasillas(casillas) {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    container.dataset.grid = JuguemosState.grid || '4x4';
    container.innerHTML = casillas.map((casilla, index) => `
        <div class="cell" data-index="${index}" title="${casilla.nombre}">
            <img src="${casilla.imagen}" alt="${casilla.nombre}" loading="lazy">
        </div>
    `).join('');
    JuguemosState.casillasAsignadas = casillas;
}

function limpiarCasillas() {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
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
    const total = getTotalCasillas(grid);
    container.innerHTML = Array(total).fill('<div class="cell"></div>').join('');
}

function updateOrderSummary() {
    const total = JuguemosState.total || 0;
    const currency = JuguemosState.currency || 'USD';
    const country = JuguemosState.country || 'Mexico';
    const mode = JuguemosState.mode || 'sencilla';
    const quantity = JuguemosState.quantity || 0;
    const modeLabel = mode === 'favoritas' ? '7 Favoritas' : mode;
    const priceText = '$' + Number(total).toFixed(2) + ' ' + currency;

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
        'j-summary-cards': `${JuguemosState.barajas?.length || 0} barajas`,
        'j-summary-paper': JuguemosState.paper,
        'j-summary-orientation': JuguemosState.orientation === "vertical" ? "Vertical" : "Horizontal",
        'j-summary-pages': `${JuguemosState.pages} páginas`,
        'j-summary-grid': { "4x4": "4x4 · 16 casillas", "5x5": "5x5 · 25 casillas", "pocitos4": "Pocitos 4", "pocitos3": "Pocitos 3", "cruzadas": "Cruzadas" }[JuguemosState.grid] || "4x4 · 16 casillas",
        'j-summary-mode': modeLabel,
        'j-summary-cutmarks': JuguemosState.cutMarks ? "Líneas de corte" : "Sin líneas de corte"
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
    const totalCasillas = getTotalCasillas(JuguemosState.grid || '4x4');
    const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
    if (!totalCasillas) return;

    const todasLasTablas = [];
    const todasLasBarajas = [...JuguemosState.barajas];

    for (let t = 0; t < totalTablas; t++) {
        const mezcladas = [...todasLasBarajas];
        for (let i = mezcladas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
        }
        const seleccionadas = [];
        const copia = [...mezcladas];
        for (let i = 0; i < totalCasillas; i++) {
            if (copia.length) {
                const idx = Math.floor(Math.random() * copia.length);
                seleccionadas.push(copia.splice(idx, 1)[0]);
            } else {
                seleccionadas.push(mezcladas[Math.floor(Math.random() * mezcladas.length)]);
            }
        }
        todasLasTablas.push(seleccionadas);
    }

    JuguemosState.todasLasTablas = todasLasTablas;
    if (todasLasTablas.length) {
        JuguemosState.casillasAsignadas = todasLasTablas[0];
        actualizarPreviewCasillas(todasLasTablas[0]);
    }
}

// =========================================================
// PROTECCIÓN
// =========================================================
document.addEventListener('dragstart', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());

// =========================================================
// INICIALIZACIÓN FINAL
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(sincronizarPais, 100);
    setTimeout(detectarGTranslate, 300);
});
