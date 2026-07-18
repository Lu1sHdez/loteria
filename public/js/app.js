document.addEventListener("DOMContentLoaded", () => {

    // ========== INICIALIZACIÓN ==========
    if (typeof JuguemosAjax !== 'undefined' && typeof JuguemosState !== 'undefined') {
        JuguemosAjax.loadCategories();
        updatePrice();
    } else {
        console.error('JuguemosAjax o JuguemosState no están definidos');
        return;
    }

// ========== SELECTOR DE PAÍS ==========
    document.querySelectorAll(".country").forEach(button => {
        button.addEventListener("click", () => {
            document
                .querySelectorAll(".country")
                .forEach(b => b.classList.remove("active"));
            button.classList.add("active");
            JuguemosState.country = button.dataset.country;
            JuguemosState.currency = button.dataset.currency;
            updatePrice();  // ← ¡ESTA LÍNEA ES CRUCIAL!
        });
    });

    // ========== RANGE Y INPUT DE TABLAS ==========
    const range = document.getElementById("tables-range");
    const input = document.getElementById("tables-number");

    if (range && input) {
        // Función para actualizar el color del rango
        function updateRangeColor() {
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            const value = parseInt(range.value) || 0;
            const percentage = ((value - min) / (max - min)) * 100;
            range.style.background = `linear-gradient(to right, #24B8C8 0%, #24B8C8 ${percentage}%, ${percentage}%, #E5E5E5 100%)`;
        }

        // Evento del RANGE
        range.addEventListener("input", () => {
            input.value = range.value;
            JuguemosState.quantity = parseInt(range.value);
            updateRangeColor();
            updatePrice();
        });

        // Evento del INPUT NUMBER
        input.addEventListener("input", () => {
            let value = parseInt(input.value);
            
            // Validar que sea un número
            if (isNaN(value)) {
                value = parseInt(range.min) || 0;
            }
            
            // Validar límites
            const min = parseInt(range.min) || 0;
            const max = parseInt(range.max) || 30;
            if (value < min) value = min;
            if (value > max) value = max;
            
            range.value = value;
            input.value = value;
            JuguemosState.quantity = value;
            updateRangeColor();
            updatePrice();
        });

        // ========== BOTONES + y - ==========
        const btnPlus = document.querySelector(".j-number-btn.plus");
        const btnMinus = document.querySelector(".j-number-btn.minus");

        if (btnPlus) {
            btnPlus.addEventListener("click", function() {
                input.stepUp();
                input.dispatchEvent(new Event("input"));
                this.blur(); // Quita el foco del botón
            });
        }

        if (btnMinus) {
            btnMinus.addEventListener("click", function() {
                input.stepDown();
                input.dispatchEvent(new Event("input"));
                this.blur(); // Quita el foco del botón
            });
        }

        // Inicializar el color del rango
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
        });
    });

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

            console.log('Barajas incluidas:', JuguemosState.barajasIncluidas);
        });
    }

});

// ========== FUNCIONES GLOBALES ==========

function updatePrice() {
    if (typeof JuguemosAjax !== 'undefined' && typeof JuguemosState !== 'undefined') {
        JuguemosAjax.loadPrice(
            JuguemosState.country,
            JuguemosState.mode,
            JuguemosState.quantity
        );
    }
}

function drawGrid() {
    console.log('Grid seleccionado:', JuguemosState.grid);
}