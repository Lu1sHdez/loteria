document.addEventListener("DOMContentLoaded", () => {

    const paperSelect = document.getElementById("j-paper-size");
    if (paperSelect) {
        paperSelect.addEventListener("change", function () {
            JuguemosState.paper = this.value;
            updateOrderSummary();
            PrintPaper.render();
        });
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

    // ========== PAÍS ==========
    document.querySelectorAll(".country").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".country").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.country = button.dataset.country;
            JuguemosState.currency = button.dataset.currency;
            updatePaperOptions();
            updatePrice();
            updateOrderSummary();
        });
    });

    // ========== RANGE Y INPUT DE TABLAS ==========
    const range = document.getElementById("tables-range");
    const input = document.getElementById("tables-number");

    if (range && input) {
        function updateRangeColor() {
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            const value = parseInt(range.value) || 0;
            const percentage = ((value - min) / (max - min)) * 100;
            range.style.background = `linear-gradient(to right, #24B8C8 0%, #24B8C8 ${percentage}%, #E5E5E5 ${percentage}%, #E5E5E5 100%)`;
        }

        range.addEventListener("input", () => {
            input.value = range.value;
            JuguemosState.quantity = parseInt(range.value);
            updateRangeColor();
            updatePrice();
            updateOrderSummary();
        });

        input.addEventListener("input", () => {
            let value = parseInt(input.value);
            if (isNaN(value)) {
                value = parseInt(range.min) || 0;
            }
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            if (value < min) value = min;
            if (value > max) value = max;
            range.value = value;
            input.value = value;
            JuguemosState.quantity = value;
            updateRangeColor();
            updatePrice();
            updateOrderSummary();
        });

        const btnPlus = document.querySelector(".j-number-btn.plus");
        const btnMinus = document.querySelector(".j-number-btn.minus");

        if (btnPlus) {
            btnPlus.addEventListener("click", function() {
                input.stepUp();
                input.dispatchEvent(new Event("input"));
                this.blur();
            });
        }

        if (btnMinus) {
            btnMinus.addEventListener("click", function() {
                input.stepDown();
                input.dispatchEvent(new Event("input"));
                this.blur();
            });
        }

        updateRangeColor();
    }

    // ========== TIPO DE TABLAS (MODO) ==========
    document.querySelectorAll(".j-mode").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-mode").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.mode = button.dataset.mode;
            updatePrice();
            updateOrderSummary();
        });
    });

    // ========== CASILLAS (GRID) ==========
    document.querySelectorAll(".j-grid").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-grid").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.grid = button.dataset.grid;
            drawGrid();
            limpiarCasillas();
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

    // =========================
    // TABLAS POR HOJA
    // =========================
    const tablesPerPageInput = document.getElementById("j-tables-per-page");
    if (tablesPerPageInput) {
        tablesPerPageInput.value = JuguemosState.quantity;
        const btnPlus = document.querySelector(".j-tables-per-page-plus");
        const btnMinus = document.querySelector(".j-tables-per-page-minus");

        btnPlus.addEventListener("click", () => {
            tablesPerPageInput.stepUp();
            JuguemosState.quantity = parseInt(tablesPerPageInput.value);
            updateOrderSummary();
        });

        btnMinus.addEventListener("click", () => {
            tablesPerPageInput.stepDown();
            JuguemosState.quantity = parseInt(tablesPerPageInput.value);
            updateOrderSummary();
        });

        tablesPerPageInput.addEventListener("input", () => {
            JuguemosState.quantity = parseInt(tablesPerPageInput.value) || 1;
            updateOrderSummary();
        });
    }

    // =========================
    // CANTIDAD DE PÁGINAS
    // =========================
    const pagesInput = document.getElementById("j-pages");
    if (pagesInput) {
        pagesInput.value = JuguemosState.pages;
        const btnPlus = document.querySelector(".j-pages-plus");
        const btnMinus = document.querySelector(".j-pages-minus");

        btnPlus.addEventListener("click", () => {
            pagesInput.stepUp();
            pagesInput.dispatchEvent(new Event("input"));
        });

        btnMinus.addEventListener("click", () => {
            pagesInput.stepDown();
            pagesInput.dispatchEvent(new Event("input"));
        });

        pagesInput.addEventListener("input", () => {
            let value = parseInt(pagesInput.value);
            if (isNaN(value) || value < 1) {
                value = 1;
            }
            pagesInput.value = value;
            JuguemosState.pages = value;
            updateOrderSummary();
        });
    }

    // =========================
    // MARCAS DE CORTE
    // =========================
    const cutMarksToggle = document.getElementById("j-cut-marks-toggle");
    const cutMarksLines = document.querySelectorAll("#j-cut-marks-preview .j-line");

    if (cutMarksToggle) {
        cutMarksToggle.checked = JuguemosState.cutMarks;
        cutMarksLines.forEach(line => {
            line.style.display = JuguemosState.cutMarks ? "" : "none";
        });

        cutMarksToggle.addEventListener("change", () => {
            JuguemosState.cutMarks = cutMarksToggle.checked;
            updateOrderSummary();
            cutMarksLines.forEach(line => {
                line.style.display = JuguemosState.cutMarks ? "" : "none";
            });
        });
    }

    // ========== COLOR DE MARCO ==========
    document.querySelectorAll(".j-color-swatch").forEach(swatch => {
        swatch.addEventListener("click", () => {
            document.querySelectorAll(".j-color-swatch").forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            JuguemosState.marcoColor = swatch.dataset.color;
            aplicarColores();
        });
    });

    // ========== COLOR DE FONDO DE TABLA ==========
    document.querySelectorAll(".j-fondo-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".j-fondo-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            card.querySelector('input[type="radio"]').checked = true;
            JuguemosState.fondoColor = card.dataset.color;
            aplicarColores();
        });
    });

    // Aplicar los colores iniciales
    aplicarColores();
    updateOrderSummary();

    // ========== BOTÓN INCLUIR BARAJAS (TOGGLE) ==========
    const btnIncluir = document.getElementById("j-incluir-barajas");
    const statusMsg = document.getElementById("j-incluir-status");

    if (btnIncluir) {
        btnIncluir.classList.add('active');
        JuguemosState.barajasIncluidas = true;

        if (statusMsg) {
            statusMsg.style.display = 'none';
        }

        btnIncluir.addEventListener("click", function() {
            const isActive = this.classList.toggle('active');
            if (isActive) {
                this.classList.remove('inactive');
                this.innerHTML = 'Incluir barajas';
                JuguemosState.barajasIncluidas = true;
                if (statusMsg) {
                    statusMsg.style.display = 'none';
                }
            } else {
                this.classList.add('inactive');
                this.innerHTML = 'No incluir barajas';
                JuguemosState.barajasIncluidas = false;
                if (statusMsg) {
                    statusMsg.textContent = 'Barajas no incluidas';
                    statusMsg.style.display = 'block';
                    statusMsg.className = 'j-incluir-status inactive';
                    statusMsg.style.color = '#898989';
                }
            }
            updateOrderSummary();
            console.log('Barajas incluidas:', JuguemosState.barajasIncluidas);
        });
    }

    // ========== BOTÓN SELECCIÓN ALEATORIA ==========
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

                if (JuguemosState.deck) {
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
                    alert('Primero selecciona un diseño.');
                    this.classList.remove('active');
                    this.classList.add('inactive');
                    this.textContent = 'Selección Aleatoria';
                }
            } else {
                this.textContent = 'Selección Aleatoria';
                this.classList.remove('active');
                this.classList.add('inactive');
                limpiarCasillas();
            }
        });
    }

    // Inicializar casillas vacías
    limpiarCasillas();

    document.querySelectorAll(".j-grid").forEach(button => {
        button.addEventListener("click", () => {
            document.querySelectorAll(".j-grid").forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.grid = button.dataset.grid;
            drawGrid();
            drawMarcosPreview();
            updateOrderSummary();
            limpiarCasillas();
        });
    });
    drawGrid();
    drawMarcosPreview();

    // =========================
    // SIGUIENTE: VISTA PREVIA
    // =========================
    const btnGoPreview = document.getElementById("j-go-preview");
    if (btnGoPreview) {
        btnGoPreview.addEventListener("click", () => {
            regenerarTodasLasTablas();
            updateOrderSummary();
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });
            console.log("Cantidad:", JuguemosState.quantity);
            document.getElementById("j-tables-per-page").value = JuguemosState.quantity;
            document.getElementById("juguemos-preview-completo").classList.add("active");
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });
            const step3 = document.querySelector('.juguemos-step[data-step="3"]');
            if (step3) {
                step3.classList.add("active");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            PrintPaper.refresh();
        });
    }

    // =========================
    // EDITAR PEDIDO
    // =========================
    const btnEditOrder = document.getElementById("j-edit-order");
    if (btnEditOrder) {
        btnEditOrder.addEventListener("click", () => {
            const tablesNumber = document.getElementById("tables-number");
            const tablesRange = document.getElementById("tables-range");
            if (tablesNumber) {
                tablesNumber.value = JuguemosState.quantity;
            }
            if (tablesRange) {
                tablesRange.value = JuguemosState.quantity;
                tablesRange.dispatchEvent(new Event("input"));
            }
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });
            document.getElementById("juguemos-design").classList.add("active");
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });
            const step1 = document.querySelector('.juguemos-step[data-step="1"]');
            if (step1) {
                step1.classList.add("active");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // =========================
    // CONFIRMAR PEDIDO - PASO 4
    // =========================
    const btnConfirmOrder = document.getElementById("j-confirm-order");
    if (btnConfirmOrder) {
        btnConfirmOrder.addEventListener("click", () => {
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });
            document.getElementById("juguemos-payment").classList.add("active");
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });
            const step4 = document.querySelector('.juguemos-step[data-step="4"]');
            if (step4) {
                step4.classList.add("active");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });

            // ✅ ACTUALIZAR RESUMEN CUANDO SE ENTRA AL PASO 4
            if (typeof JuguemosPaymentInstance !== 'undefined') {
                JuguemosPaymentInstance.updatePaymentSummary();
            }
        });
    }
        // =========================
    // ACTUALIZAR TOTAL EN EL PASO 4
    // =========================
    function updateTotalInStep4() {
        const total = JuguemosState.total || 0;
        const currency = JuguemosState.currency || 'USD';
        const priceEl = document.getElementById('summary-price');
        if (priceEl) {
            priceEl.textContent = `$${Number(total).toFixed(2)} ${currency}`;
        }
    }

    // Llamar cuando se entra al paso 4
    const observer = new MutationObserver(function() {
        const step4 = document.getElementById('juguemos-payment');
        if (step4 && step4.classList.contains('active')) {
            updateTotalInStep4();
            if (typeof JuguemosPaymentInstance !== 'undefined') {
                JuguemosPaymentInstance.updatePaymentSummary();
            }
        }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class'] });

    // =========================
    // REGRESAR A VISTA PREVIA (DESDE PAGO)
    // =========================
    const btnBackToPreview = document.getElementById("j-back-to-preview");
    if (btnBackToPreview) {
        btnBackToPreview.addEventListener("click", () => {
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });
            document.getElementById("juguemos-preview-completo").classList.add("active");
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });
            const step3 = document.querySelector('.juguemos-step[data-step="3"]');
            if (step3) {
                step3.classList.add("active");
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
            if (typeof PrintPaper !== 'undefined') {
                setTimeout(() => {
                    PrintPaper.refresh();
                }, 300);
            }
        });
    }

    // =========================
    // ✅ VERIFICACIÓN DE PAGO (FUERA DE LOS EVENTOS)
    // =========================

    // 1. Detectar descarga después de pago exitoso
    const urlParams = new URLSearchParams(window.location.search);
    const downloadParam = urlParams.get('download');

    if (downloadParam === 'pdf') {
        const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const paymentToken = sessionStorage.getItem('juguemos_payment_token');
        
        if (paymentVerified && paymentToken) {
            if (typeof JuguemosPDF !== 'undefined') {
                setTimeout(() => {
                    JuguemosPDF.generate();
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                }, 800);
            }
        } else {
            console.warn('⚠️ No se encontró verificación de pago');
            setTimeout(() => {
                window.location.href = '/juguemos';
            }, 2000);
        }
    }

    // 2. Verificar estado de pago al cargar (si estamos en paso 4)
    const step4 = document.getElementById('juguemos-payment');
    if (step4 && step4.classList.contains('active')) {
        const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
        const paymentToken = sessionStorage.getItem('juguemos_payment_token');
        
        if (paymentVerified && paymentToken) {
            console.log('✅ Pago verificado previamente');
            if (typeof JuguemosPaymentInstance !== 'undefined') {
                JuguemosPaymentInstance.paymentSuccess();
            }
        }
    }

    // 3. Escuchar mensaje de PayPal (ventana popup)
    window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'paypal_payment_completed') {
            console.log('✅ PayPal: Pago completado en ventana popup');
            
            sessionStorage.setItem('juguemos_payment_verified', 'true');
            sessionStorage.setItem('juguemos_payment_token', event.data.token || 'verified');
            
            if (typeof JuguemosPaymentInstance !== 'undefined') {
                JuguemosPaymentInstance.paymentSuccess();
            }
        }
    });

    // 4. Botón Descargar PDF (DENTRO de DOMContentLoaded)
    const btnDownload = document.getElementById('j-download-pdf');
    if (btnDownload) {
        btnDownload.addEventListener('click', function(e) {
            e.preventDefault();
            
            const paymentVerified = sessionStorage.getItem('juguemos_payment_verified') === 'true';
            const paymentToken = sessionStorage.getItem('juguemos_payment_token');
            
            if (paymentVerified && paymentToken) {
                if (typeof JuguemosPDF !== 'undefined') {
                    JuguemosPDF.generate();
                }
                return;
            }
            
            alert('Por favor, realiza el pago antes de descargar el PDF.');
        });
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
    select.innerHTML = "";
    if (JuguemosState.country === "Mexico") {
        select.innerHTML = `
            <option value="carta">Carta (21.59 × 27.94 cm)</option>
            <option value="oficio">Oficio (21.59 × 33.02 cm)</option>
            <option value="a4">A4 (21 × 29.7 cm)</option>
        `;
    } else {
        select.innerHTML = `
            <option value="letter">Letter (8.5 × 11 in)</option>
            <option value="legal">Legal (8.5 × 14 in)</option>
            <option value="a4">A4 (8.27 × 11.69 in)</option>
        `;
    }
    select.selectedIndex = 0;
    JuguemosState.paper = select.value;
}

function drawGrid() {
    const grid = JuguemosState.grid || '4x4';
    const container = document.getElementById('j-grid-preview');
    if (!container) return;
    container.dataset.grid = grid;
    let cells = 0;
    switch(grid) {
        case '4x4': cells = 16; break;
        case '5x5': cells = 25; break;
        case 'pocitos4': cells = 4; break;
        case 'pocitos3': cells = 3; break;
        case 'cruzadas': cells = 5; break;
        default: cells = 16;
    }
    let html = '';
    for (let i = 0; i < cells; i++) {
        html += `<div class="cell"></div>`;
    }
    container.innerHTML = html;
}

function getTotalCasillas(grid) {
    switch(grid) {
        case '4x4': return 16;
        case '5x5': return 25;
        case 'pocitos4': return 4;
        case 'pocitos3': return 3;
        case 'cruzadas': return 5;
        default: return 16;
    }
}

function llenarCasillasAleatorio() {
    if (!JuguemosState.deck) {
        alert('Primero selecciona un diseño.');
        return;
    }
    if (!JuguemosState.barajas || JuguemosState.barajas.length === 0) {
        alert('No hay barajas disponibles para este diseño.');
        return;
    }
    const grid = JuguemosState.grid || '4x4';
    const totalCasillas = getTotalCasillas(grid);
    const tablasPorHoja = JuguemosState.quantity || 1;
    const paginas = JuguemosState.pages || 1;
    const totalTablas = tablasPorHoja * paginas;
    if (totalCasillas === 0) {
        alert('Configuración de casillas no válida.');
        return;
    }
    const todasLasTablas = [];
    const todasLasBarajas = [...JuguemosState.barajas];
    for (let tabla = 0; tabla < totalTablas; tabla++) {
        const barajasMezcladas = [...todasLasBarajas];
        for (let i = barajasMezcladas.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [barajasMezcladas[i], barajasMezcladas[j]] = [barajasMezcladas[j], barajasMezcladas[i]];
        }
        const casillasSeleccionadas = [];
        const copiaBarajas = [...barajasMezcladas];
        for (let i = 0; i < totalCasillas; i++) {
            if (copiaBarajas.length > 0) {
                const indice = Math.floor(Math.random() * copiaBarajas.length);
                casillasSeleccionadas.push(copiaBarajas.splice(indice, 1)[0]);
            } else {
                const reinicio = [...barajasMezcladas];
                const indice = Math.floor(Math.random() * reinicio.length);
                casillasSeleccionadas.push(reinicio[indice]);
            }
        }
        todasLasTablas.push(casillasSeleccionadas);
    }
    JuguemosState.todasLasTablas = todasLasTablas;
    if (todasLasTablas.length > 0) {
        JuguemosState.casillasAsignadas = todasLasTablas[0];
        actualizarPreviewCasillas(todasLasTablas[0]);
    }
}

function actualizarPreviewCasillas(casillas) {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    let html = '';
    casillas.forEach((casilla, index) => {
        html += `
            <div class="cell" data-index="${index}" title="${casilla.nombre}">
                <img src="${casilla.imagen}" alt="${casilla.nombre}" loading="lazy">
            </div>
        `;
    });
    container.innerHTML = html;
    JuguemosState.casillasAsignadas = casillas;
}

function limpiarCasillas() {
    const container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    const grid = JuguemosState.grid || '4x4';
    container.dataset.grid = grid;
    const totalCasillas = getTotalCasillas(grid);
    let html = '';
    for (let i = 0; i < totalCasillas; i++) {
        html += `<div class="cell empty" data-index="${i}"></div>`;
    }
    container.innerHTML = html;
    JuguemosState.casillasAsignadas = [];
    JuguemosState.todasLasTablas = [];
}

function aplicarColores() {
    document.documentElement.style.setProperty('--j-marco-color', JuguemosState.marcoColor || '#FA299C');
    document.documentElement.style.setProperty('--j-fondo-color', JuguemosState.fondoColor || '#FFFFFF');
}

function drawMarcosPreview() {
    const grid = JuguemosState.grid || '4x4';
    const container = document.getElementById('j-marcos-preview-grid');
    if (!container) return;
    container.dataset.grid = grid;
    const totalCasillas = getTotalCasillas(grid);
    let html = '';
    for (let i = 0; i < totalCasillas; i++) {
        html += `<div class="cell"></div>`;
    }
    container.innerHTML = html;
}

function updateOrderSummary() {
    // ✅ Para el paso 4 (pago)
    const countryEl = document.getElementById('payment-summary-country');
    if (countryEl) countryEl.textContent = JuguemosState.country || 'Mexico';
    
    const modeEl = document.getElementById('payment-summary-mode');
    if (modeEl) modeEl.textContent = JuguemosState.mode === 'favoritas' ? '7 Favoritas' : JuguemosState.mode;
    
    const quantityEl = document.getElementById('payment-summary-quantity');
    if (quantityEl) quantityEl.textContent = JuguemosState.quantity || 0;
    
    const priceEl = document.getElementById('payment-summary-price');
    if (priceEl) {
        const total = JuguemosState.total || 0;
        const currency = JuguemosState.currency || 'USD';
        priceEl.textContent = `$${Number(total).toFixed(2)} ${currency}`;
    }
    
    // ✅ Para el resto de la página (pasos 1-3)
    document.getElementById("j-summary-tables").textContent = `${JuguemosState.quantity} tablas por hoja`;
    document.getElementById("j-summary-cards").textContent = `${JuguemosState.barajas.length} barajas`;
    document.getElementById("j-summary-paper").textContent = JuguemosState.paper;
    document.getElementById("j-summary-orientation").textContent = JuguemosState.orientation === "vertical" ? "Vertical" : "Horizontal";
    document.getElementById("j-summary-pages").textContent = `${JuguemosState.pages} páginas`;
    document.getElementById("j-summary-grid").textContent = {
        "4x4": "4x4 · 16 casillas",
        "5x5": "5x5 · 25 casillas",
        "pocitos4": "Pocitos 4",
        "pocitos3": "Pocitos 3",
        "cruzadas": "Cruzadas"
    }[JuguemosState.grid];
    document.getElementById("j-summary-mode").textContent = JuguemosState.mode === "favoritas" ? "7 Favoritas" : JuguemosState.mode;
    document.getElementById("j-summary-cutmarks").textContent = JuguemosState.cutMarks ? "Líneas de corte" : "Sin líneas de corte";
}

function regenerarTodasLasTablas() {
    llenarCasillasAleatorio();
}