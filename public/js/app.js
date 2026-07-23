document.addEventListener("DOMContentLoaded", () => {

    const paperSelect = document.getElementById("j-paper-size");
    if (paperSelect) {
        paperSelect.addEventListener("change", function () {
            JuguemosState.paper = this.value;
            updateOrderSummary();

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

    document.querySelectorAll(".country").forEach(button => {
        button.addEventListener("click", () => {
    
            document
                .querySelectorAll(".country")
                .forEach(b => b.classList.remove("active"));
    
            button.classList.add("active");
    
            JuguemosState.country = button.dataset.country;
            JuguemosState.currency = button.dataset.currency;
    
            updatePaperOptions(); // ← actualiza el select
    

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
            document
                .querySelectorAll(".j-mode")
                .forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.mode = button.dataset.mode;
            updatePrice();
            updateOrderSummary();
        });
    });

    // ========== CASILLAS (GRID) ==========
    document.querySelectorAll(".j-grid").forEach(button => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".j-grid")
                .forEach(b => b.classList.remove("active"));
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

            document
                .querySelectorAll(".j-orientation")
                .forEach(b => b.classList.remove("active"));

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
            JuguemosState.quantity  =
                parseInt(tablesPerPageInput.value) || 1;
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
            document
                .querySelectorAll(".j-color-swatch")
                .forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            JuguemosState.marcoColor = swatch.dataset.color;
            aplicarColores();
        });
    });

    // ========== COLOR DE FONDO DE TABLA ==========
    document.querySelectorAll(".j-fondo-card").forEach(card => {
        card.addEventListener("click", () => {
            document
                .querySelectorAll(".j-fondo-card")
                .forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            card.querySelector('input[type="radio"]').checked = true;
            JuguemosState.fondoColor = card.dataset.color;
            aplicarColores();
        });
    });

    // Aplicar los colores iniciales (por defecto) al cargar la página
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
            document
                .querySelectorAll(".j-grid")
                .forEach(b => b.classList.remove("active"));
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
            updateOrderSummary();

            // Ocultar todos los pasos
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });

            console.log("Cantidad:", JuguemosState.quantity);

            document.getElementById("j-tables-per-page").value =
                JuguemosState.quantity;
                
            // Mostrar el paso 3
            document
                .getElementById("juguemos-preview-completo")
                .classList.add("active");
            requestAnimationFrame(drawCutMarks);

            // Actualizar el encabezado
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });

            const step3 = document.querySelector(
                '.juguemos-step[data-step="3"]'
            );

            if (step3) {
                step3.classList.add("active");
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
            PrintPreview.refresh();

        });

    }


    // =========================
    // EDITAR PEDIDO
    // =========================

    const btnEditOrder = document.getElementById("j-edit-order");

    if (btnEditOrder) {

        btnEditOrder.addEventListener("click", () => {
            
            // Sincronizar los controles del paso 1
            const tablesNumber = document.getElementById("tables-number");
            const tablesRange = document.getElementById("tables-range");

            if (tablesNumber) {
                tablesNumber.value = JuguemosState.quantity;
            }

            if (tablesRange) {
                tablesRange.value = JuguemosState.quantity;
                tablesRange.dispatchEvent(new Event("input"));
            }
            

            // Ocultar todos los pasos
            document.querySelectorAll(".j-step").forEach(step => {
                step.classList.remove("active");
            });

            // Mostrar el paso 1
            document
                .getElementById("juguemos-design")
                .classList.add("active");

            // Actualizar el encabezado
            document.querySelectorAll(".juguemos-step").forEach(step => {
                step.classList.remove("active");
            });

            const step1 = document.querySelector(
                '.juguemos-step[data-step="1"]'
            );

            if (step1) {
                step1.classList.add("active");
            }

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

    }
});

function updatePrice() {
    if (typeof JuguemosAjax !== 'undefined' && typeof JuguemosState !== 'undefined') {
        JuguemosAjax.loadPrice(
            JuguemosState.country,
            JuguemosState.mode,
            JuguemosState.quantity
        );
    }
}
function updatePaperOptions() {

    const select = document.getElementById("j-paper-size");

    if (!select) return;

    const currentValue = JuguemosState.paper;

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
    let label = '';
    
    switch(grid) {
        case '4x4': cells = 16; label = '4x4'; break;
        case '5x5': cells = 25; label = '5x5'; break;
        case 'pocitos4': cells = 4; label = 'Pocitos 4'; break;
        case 'pocitos3': cells = 3; label = 'Pocitos 3'; break;
        case 'cruzadas': cells = 5; label = 'Cruzadas'; break;
        default: cells = 16; label = '4x4';
    }
    
    let html = '';
    for (let i = 0; i < cells; i++) {
        html += `<div class="cell"></div>`;
    }
    
    container.innerHTML = html;
    console.log(`Grid dibujado: ${label} (${cells} casillas)`);
}

// ========== FUNCIONES PARA CASILLAS ==========

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
    
    if (totalCasillas === 0) {
        alert('Configuración de casillas no válida.');
        return;
    }

    const barajasDisponibles = [...JuguemosState.barajas];
    
    // Fisher-Yates shuffle
    for (let i = barajasDisponibles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [barajasDisponibles[i], barajasDisponibles[j]] = [barajasDisponibles[j], barajasDisponibles[i]];
    }

    const casillasSeleccionadas = barajasDisponibles.slice(0, totalCasillas);
    
    while (casillasSeleccionadas.length < totalCasillas) {
        const barajaExtra = barajasDisponibles[Math.floor(Math.random() * barajasDisponibles.length)];
        casillasSeleccionadas.push(barajaExtra);
    }

    actualizarPreviewCasillas(casillasSeleccionadas);
    JuguemosState.casillasAsignadas = casillasSeleccionadas;
    
    console.log(`Casillas llenadas: ${casillasSeleccionadas.length} barajas asignadas`);
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
                <span class="cell-number">${index + 1}</span>
            </div>
        `;
    });
    
    container.innerHTML = html;
    console.log(`Preview actualizado con ${casillas.length} casillas`);
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
    console.log('Casillas limpiadas');
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


function updateOrderSummary(){

    document.getElementById("j-summary-tables").textContent =
        `${JuguemosState.quantity} tablas por hoja`;

    document.getElementById("j-summary-cards").textContent =
        `${JuguemosState.barajas.length} barajas`;

    document.getElementById("j-summary-paper").textContent =
        JuguemosState.paper;

    document.getElementById("j-summary-orientation").textContent =
        JuguemosState.orientation === "vertical"
            ? "Vertical"
            : "Horizontal";

    document.getElementById("j-summary-pages").textContent =
        `${JuguemosState.pages} páginas`;

    document.getElementById("j-summary-grid").textContent = {

        "4x4":"4x4 · 16 casillas",
        "5x5":"5x5 · 25 casillas",
        "pocitos4":"Pocitos 4",
        "pocitos3":"Pocitos 3",
        "cruzadas":"Cruzadas"

    }[JuguemosState.grid];

    document.getElementById("j-summary-mode").textContent =

        JuguemosState.mode === "favoritas"
            ? "7 Favoritas"
            : JuguemosState.mode;

    document.getElementById("j-summary-cutmarks").textContent =

        JuguemosState.cutMarks
            ? "Líneas de corte"
            : "Sin líneas de corte";

}

