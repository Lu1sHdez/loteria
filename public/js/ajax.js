const JuguemosAjax = {

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

    loadDecks(categoriaId) {
        const container = document.getElementById("juguemos-decks");
        container.innerHTML = `<p class="text-p-normal"> Cargando diseños...</p>`;

        fetch(
            Juguemos.ajax_url +
            "?action=juguemos_decks&categoria_id=" +
            encodeURIComponent(categoriaId)
        )
        .then(r => r.json())
        .then(async (response) => {
            if (!response.success || !response.data.length) {
                container.innerHTML = `<p class="text-p-normal" style="text-align: center;">Actualmente no tenemos diseños en esta categoría. <br><br> <span class="text-rosa-negrita">¡Espéralos próximamente!</span></p>`;
                const btn = document.getElementById("j-decks-view-all");
                if (btn) {
                    btn.style.display = "none";
                }
                return;
            }

            window.allDesigns = response.data;

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

            const btn = document.getElementById("j-decks-view-all");
            if (btn) {
                btn.style.display = response.data.length > 3 ? "block" : "none";
            }

            container.querySelectorAll(".j-deck").forEach(card => {
                card.addEventListener("click", function() {
                    container.querySelectorAll(".j-deck").forEach(c => c.classList.remove("active"));
                    this.classList.add("active");
                    JuguemosAjax.seleccionarDiseno(this.dataset.id);
                });
            });

            const firstDeck = container.querySelector('.j-deck');
            if (firstDeck) {
                const designId = firstDeck.dataset.id;
                await JuguemosAjax.loadBarajas(designId);
                JuguemosAjax.seleccionarDiseno(designId);
            }

            renderModalDecks();
        })
        .catch(error => {
            console.error('Error loading decks:', error);
            container.innerHTML = "<p>Error al cargar los diseños.</p>";
        });
    },

    seleccionarDiseno(designId) {

        JuguemosState.deck = designId;
            if (typeof limpiarCasillas === 'function') {
            limpiarCasillas();
        }
    
        if (typeof drawMarcosPreview === 'function') {
            drawMarcosPreview();
        }
    
        // Cargar portada
        JuguemosAjax.loadDesignPreview(designId);
    
        // Cargar barajas y SOLO después llenar
        JuguemosAjax.loadBarajas(designId)
            .then(function(barajas) {
    
                if (!barajas || !barajas.length) {
                    console.warn('No hay barajas para el diseño:', designId);
                    return;
                }
    
                // Verificar que siga seleccionado el mismo diseño
                if (JuguemosState.deck != designId) {
                    return;
                }
    
                llenarCasillasAutomatico();
                var event = new Event('gridChanged');
                document.dispatchEvent(event);
    
            })
            .catch(function(error) {
                console.error('Error cargando barajas:', error);
            });
    },

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

    loadBarajas(designId) {
        return new Promise(function(resolve, reject) {
            fetch(
                Juguemos.ajax_url +
                "?action=juguemos_barajas&design_id=" +
                encodeURIComponent(designId)
            )
            .then(r => r.json())
            .then(response => {
                if (!response.success || !response.data.length) {
                    JuguemosState.barajas = [];
                    resolve([]);
                    return;
                }
                JuguemosState.barajas = response.data;
                resolve(JuguemosState.barajas);
            })
            .catch(error => {
                console.error('Error loading barajas:', error);
                JuguemosState.barajas = [];
                reject(error);
            });
        });
    },

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

function renderModalDecks() {
    const grid = document.getElementById("j-decks-modal-grid");
    const allDesigns = window.allDesigns || [];
    if (!grid) return;

    let html = "";
    allDesigns.forEach(function(design) {
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

    grid.querySelectorAll(".j-deck").forEach(function(card) {
        card.addEventListener("click", function() {
            const id = this.dataset.id;

            document.getElementById("j-decks-modal").classList.remove("active");

            const container = document.getElementById("juguemos-decks");
            container.querySelectorAll(".j-deck").forEach(function(c) {
                c.classList.remove("active");
            });

            const selected = container.querySelector('.j-deck[data-id="' + id + '"]');
            if (selected) {
                selected.classList.add("active");
            }

            JuguemosAjax.seleccionarDiseno(id);
        });
    });
}

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById("j-decks-view-all")?.addEventListener("click", function() {
        document.getElementById("j-decks-modal").classList.add("active");
        renderModalDecks();
    });

    document.getElementById("j-decks-modal-close")?.addEventListener("click", function() {
        document.getElementById("j-decks-modal").classList.remove("active");
    });

    document.getElementById("j-decks-modal")?.addEventListener("click", function(e) {
        if (e.target === this) {
            this.classList.remove("active");
        }
    });

    document.addEventListener("keydown", function(e) {
        if (e.key === "Escape") {
            document.getElementById("j-decks-modal")?.classList.remove("active");
        }
    });
});
