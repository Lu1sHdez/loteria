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
        container.innerHTML = "Cargando diseños...";
    
        fetch(
            Juguemos.ajax_url +
            "?action=juguemos_decks&categoria_id=" +
            encodeURIComponent(categoriaId)
        )
        .then(r => r.json())
        .then(response => {
            if (!response.success || !response.data.length) {
                container.innerHTML = "<p>No se encontraron diseños.</p>";
                return;
            }
    
            let html = "";
            response.data.forEach((design, index) => {
                const activeClass = index === 0 ? 'active' : '';
                html += `
                    <div class="j-deck ${activeClass}" data-id="${design.id}">
                        <div class="j-deck-image">
                            <img
                                src="${design.portada}"
                                alt="${design.nombre}"
                                loading="lazy"
                            >
                        </div>
                        <div class="j-deck-name">
                            ${design.nombre}
                        </div>
                    </div>
                `;
            });
    
            container.innerHTML = html;
    
            // Selección automática al hacer clic en la tarjeta
            container.querySelectorAll(".j-deck").forEach(card => {
                card.addEventListener("click", function() {
                    container
                        .querySelectorAll(".j-deck")
                        .forEach(c => c.classList.remove("active"));
                    this.classList.add("active");
                    JuguemosState.deck = this.dataset.id;
                    JuguemosAjax.loadDesignPreview(this.dataset.id);
                });
            });
    
            // Cargar automáticamente el primer diseño
            const firstDeck = container.querySelector('.j-deck');
            if (firstDeck) {
                JuguemosState.deck = firstDeck.dataset.id;
                JuguemosAjax.loadDesignPreview(firstDeck.dataset.id);
            }
        })
        .catch(error => {
            console.error('Error loading decks:', error);
            container.innerHTML = "<p>Error al cargar los diseños.</p>";
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
            
            // Solo la portada, sin mensajes de estado
            let html = `
                <div class="j-preview-cover">
                    <img src="${design.portada}" alt="${design.nombre}">
                </div>
                <div class="j-preview-title">
                    <h3>${design.nombre}</h3>
                </div>
            `;
            
            preview.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading design preview:', error);
        });
    },

    // Carga las barajas en el estado (sin mostrarlas en el preview)
    loadBarajas(designId) {
        fetch(
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
            
            // Actualizar el resumen
            const summaryCountry = document.getElementById("summary-country");
            const summaryMode = document.getElementById("summary-mode");
            const summaryQuantity = document.getElementById("summary-quantity");
            const summaryPrice = document.getElementById("summary-price");
            
            if (summaryCountry) summaryCountry.textContent = response.data.pais;
            if (summaryMode) summaryMode.textContent = response.data.modo;
            if (summaryQuantity) summaryQuantity.textContent = response.data.cantidad;
            if (summaryPrice) {
                summaryPrice.textContent = "$" + Number(response.data.total).toFixed(2) + " " + response.data.moneda;
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