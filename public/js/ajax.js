const JuguemosAjax = {

    // ==========================================
    // CARGAR CATEGORÍAS
    // ==========================================

    loadCategories() {
        fetch(
            Juguemos.ajax_url + "?action=juguemos_categories"
        )
        .then(response => response.json())
        .then(response => {
            if (!response.success || !response.data.length) {
                return;
            }

            const container = document.getElementById("juguemos-categories");
            container.innerHTML = "";

            response.data.forEach((category, index) => {
                const button = document.createElement("button");
                button.className = "j-category" + (index === 0 ? " active" : "");
                button.textContent = category.nombre;
                button.dataset.id = category.id;
                button.onclick = () => {
                    document
                        .querySelectorAll(".j-category")
                        .forEach(b => b.classList.remove("active"));
                    button.classList.add("active");
                    JuguemosState.category = category.id;
                    JuguemosAjax.loadDecks(category.id);
                };
                container.appendChild(button);
            });

            JuguemosState.category = response.data[0].id;
            JuguemosAjax.loadDecks(response.data[0].id);
        })
        .catch(error => {
            console.error('Error loading categories:', error);
        });
    },

    // ==========================================
    // CARGAR DISEÑOS (GRID NORMAL + MODAL)
    // ==========================================

    loadDecks(categoriaId) {
        const container = document.getElementById("juguemos-decks");
        container.innerHTML = "Cargando diseños...";
    
        fetch(
            Juguemos.ajax_url +
            "?action=juguemos_decks&categoria_id=" +
            encodeURIComponent(categoriaId)
        )
        .then(r => r.json())
        .then(response => {
            if (!response.success || !response.data.length) {
                container.innerHTML = "<p>Actualmente no tenemos diseños en esta categoría. ¡Espéralos próximamente!</p>";
                const btn = document.getElementById("j-decks-view-all");
                if (btn) {
                    btn.style.display = "none";
                }
                return;
            }
    
            // Guardar todos los diseños para el modal
            window.allDesigns = response.data;
    
            // Renderizar grid normal (todos los diseños)
            let html = "";

            response.data.slice(0, 3).forEach((design, index) => {
                const activeClass = index === 0 ? "active" : "";

                html += `
                    <div class="j-deck ${activeClass}" data-id="${design.id}">
                        <div class="j-deck-image">
                            <img src="${design.portada}" alt="${design.nombre}" loading="lazy">
                        </div>
                        <div class="j-deck-name">${design.nombre}</div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Mostrar u ocultar el botón
            const btn = document.getElementById("j-decks-view-all");
            if (btn) {
                btn.style.display = response.data.length > 3 ? "block" : "none";
            }
    
            // Eventos de selección en el grid normal
            container.querySelectorAll(".j-deck").forEach(card => {
                card.addEventListener("click", function() {
                    container.querySelectorAll(".j-deck").forEach(c => c.classList.remove("active"));
                    this.classList.add("active");
                    JuguemosAjax.seleccionarDiseno(this.dataset.id);
                });
            });
    
            // Seleccionar el primero automáticamente
            const firstDeck = container.querySelector('.j-deck');
            if (firstDeck) {
                JuguemosAjax.seleccionarDiseno(firstDeck.dataset.id);
            }
    
            // Renderizar modal (con todos los diseños)
            renderModalDecks();
        })
        .catch(error => {
            console.error('Error loading decks:', error);
            container.innerHTML = "<p>Error al cargar los diseños.</p>";
        });
    },

    // ==========================================
    // SELECCIONAR DISEÑO
    // ==========================================

    seleccionarDiseno(designId) {
        JuguemosState.deck = designId;
        JuguemosState.barajas = [];
    
        JuguemosAjax.loadDesignPreview(designId);
        JuguemosAjax.loadBarajas(designId).then(() => {
            if (typeof llenarCasillasAutomatico === 'function') {
                setTimeout(() => {
                    llenarCasillasAutomatico();
                }, 200);
            }
        });
    
        const btnAleatoria = document.querySelector(".j-casilla-btn");
        if (btnAleatoria) {
            btnAleatoria.classList.remove('active');
            btnAleatoria.classList.add('inactive');
            btnAleatoria.textContent = 'Selección Aleatoria';
        }
        if (typeof limpiarCasillas === 'function') {
            limpiarCasillas();
        }
        if (typeof drawMarcosPreview === 'function') {  
            drawMarcosPreview();
        }
    },

    // ==========================================
    // VISTA PREVIA DE DISEÑO
    // ==========================================

    loadDesignPreview(designId) {
        fetch(
            Juguemos.ajax_url + "?action=juguemos_get_design&design_id=" + encodeURIComponent(designId)
        )
        .then(r => r.json())
        .then(response => {
            if (!response.success) {
                console.error('Error al cargar diseño:', response.data);
                return;
            }
    
            const design = response.data;
            const preview = document.getElementById("deck-preview");
            
            let html = `
                <div class="j-preview-cover">
                    <img src="${design.portada}" alt="${design.nombre}">
                </div>
                <div class="j-preview-title">
                    <p>${design.nombre}</p>
                </div>
            `;
            
            preview.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading design preview:', error);
        });
    },

    // ==========================================
    // CARGAR BARAJAS
    // ==========================================

    loadBarajas(designId) {
        return fetch(
            Juguemos.ajax_url +
            "?action=juguemos_barajas&design_id=" +
            encodeURIComponent(designId)
        )
        .then(r => r.json())
        .then(response => {
            if (!response.success || !response.data.length) {
                JuguemosState.barajas = [];
                return;
            }
            JuguemosState.barajas = response.data;
        })
        .catch(error => {
            console.error('Error loading barajas:', error);
            JuguemosState.barajas = [];
        });
    },

    // ==========================================
    // CARGAR PRECIO
    // ==========================================

    loadPrice(pais, modo, cantidad) {
        fetch(
            Juguemos.ajax_url +
            "?action=juguemos_price" +
            "&pais=" + encodeURIComponent(pais) +
            "&modo=" + encodeURIComponent(modo) +
            "&cantidad=" + cantidad
        )
        .then(r => r.json())
        .then(response => {
            if (!response.success) {
                return;
            }
            JuguemosState.unitPrice = response.data.precio_unitario;
            JuguemosState.total = response.data.total;
            JuguemosState.currency = response.data.moneda;
            
            if (typeof updateOrderSummary === 'function') {
                updateOrderSummary();
            }
            
            if (typeof JuguemosPaymentInstance !== 'undefined') {
                JuguemosPaymentInstance.updatePaymentSummary();
            }
        })
        .catch(error => {
            console.error('Error loading price:', error);
        });
    },

    loadPreview() {
        console.log("Vista previa");
    }
};

// ==========================================
// RENDERIZAR MODAL
// ==========================================

function renderModalDecks() {
    const grid = document.getElementById("j-decks-modal-grid");
    const allDesigns = window.allDesigns || [];
    if (!grid) return;

    let html = "";
    allDesigns.forEach(design => {        
        html += `
            <div class="j-deck" data-id="${design.id}">
                <div class="j-deck-image">
                    <img src="${design.portada}" alt="${design.nombre}" loading="lazy">
                </div>
                <div class="j-deck-name">${design.nombre}</div>
            </div>
        `;
    });

    grid.innerHTML = html;

    // Eventos de selección en el modal
    grid.querySelectorAll(".j-deck").forEach(card => {
        card.addEventListener("click", function() {
            const id = this.dataset.id;

            // Cerrar modal
            document.getElementById("j-decks-modal").classList.remove("active");

            // Seleccionar en el grid normal
            const container = document.getElementById("juguemos-decks");
            container.querySelectorAll(".j-deck").forEach(c => c.classList.remove("active"));

            const selected = container.querySelector(`.j-deck[data-id="${id}"]`);
            if (selected) {
                selected.classList.add("active");
            }

            JuguemosAjax.seleccionarDiseno(id);
        });
    });
}

// ==========================================
// EVENTOS DEL MODAL
// ==========================================

document.addEventListener("DOMContentLoaded", function() {

    // Abrir modal
    document.getElementById("j-decks-view-all")?.addEventListener("click", function() {
        document.getElementById("j-decks-modal").classList.add("active");
        renderModalDecks();
    });

    // Cerrar modal con X
    document.getElementById("j-decks-modal-close")?.addEventListener("click", function() {
        document.getElementById("j-decks-modal").classList.remove("active");
    });

    // Cerrar modal al hacer clic fuera
    document.getElementById("j-decks-modal")?.addEventListener("click", function(e) {
        if (e.target === this) {
            this.classList.remove("active");
        }
    });

    // Cerrar modal con ESC
    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            document.getElementById("j-decks-modal")?.classList.remove("active");
        }
    });
});
