const JuguemosAjax = {

    loadCategories() {

        fetch(
            Juguemos.ajax_url + "?action=juguemos_categories"
        )
        .then(response => response.json())
        .then(response => {
    
            if (!response.success) {
                return;
            }
    
            const container = document.getElementById("juguemos-categories");
    
            container.innerHTML = "";
    
            response.data.forEach(category => {
    
                const button = document.createElement("button");

                button.className = "j-category";

                button.textContent = category.nombre;

                button.onclick = () => {

                    document
                        .querySelectorAll(".j-category")
                        .forEach(b=>b.classList.remove("active"));

                    button.classList.add("active");

                    JuguemosAjax.loadDecks(category.nombre);

                };

                container.appendChild(button);
    
            });
    
        });
    
    },

    loadDecks(category){

        fetch(
    
            Juguemos.ajax_url +
    
            "?action=juguemos_decks&category=" +
    
            encodeURIComponent(category)
    
        )
    
        .then(r=>r.json())
    
        .then(response => {

            const container = document.getElementById("juguemos-decks");
        
            if (!response.success) {
                container.innerHTML = "<p>No se encontraron barajas.</p>";
                return;
            }
        
            let html = "";
        
            response.data.forEach(deck => {
        
                html += `
        
                    <div class="j-deck" data-id="${deck.id}">
        
                        <div class="j-deck-image">
        
                            <img
                                src="${deck.portada}"
                                alt="${deck.nombre}"
                                loading="lazy"
                            >
        
                        </div>
        
                        ${
                            Number(deck.popular) === 1
                                ? `<div class="deck-popular">❤️ Popular</div>`
                                : ``
                        }
        
                        <div class="j-deck-name">
        
                            ${deck.nombre}
        
                        </div>
        
                    </div>
        
                `;
        
            });
        
            container.innerHTML = html;
        
        });
    
    },

    loadPreview(){

        console.log("Vista previa");

    }

};