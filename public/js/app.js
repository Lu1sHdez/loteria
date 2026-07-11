document.addEventListener("DOMContentLoaded", () => {

    // Cargar categorías
    JuguemosAjax.loadCategories();

    // Cargar precio inicial usando el estado global
    JuguemosAjax.loadPrice(
        JuguemosState.country,
        "sencilla",
        18
    );

    // Selector de país
    document.querySelectorAll(".country").forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".country")
                .forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            JuguemosState.country = button.dataset.country;
            JuguemosState.currency = button.dataset.currency;

            // Actualizar el precio automáticamente
            JuguemosAjax.loadPrice(
                JuguemosState.country,
                "sencilla",
                18
            );

        });

    });

});