document.addEventListener("DOMContentLoaded", () => {

    // Cargar categorías
    JuguemosAjax.loadCategories();

    updatePrice();

    // Selector de país
    document.querySelectorAll(".country").forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".country")
                .forEach(b => b.classList.remove("active"));

            button.classList.add("active");

            JuguemosState.country = button.dataset.country;
            JuguemosState.currency = button.dataset.currency;

            updatePrice();

        }); 

    });

    const range=document.getElementById("tables-range");
    const input=document.getElementById("tables-number");

    range.addEventListener("input",()=>{

        input.value=range.value;

        JuguemosState.quantity=parseInt(range.value);

        updatePrice();

    });

    input.addEventListener("input",()=>{

        range.value=input.value;

        JuguemosState.quantity=parseInt(input.value);

        updatePrice();

    });

    document.querySelectorAll(".j-mode").forEach(button=>{

        button.addEventListener("click",()=>{
    
            document
                .querySelectorAll(".j-mode")
                .forEach(b=>b.classList.remove("active"));
    
            button.classList.add("active");
    
            JuguemosState.mode=button.dataset.mode;
    
            updatePrice();
    
        });
    
    });

    document.querySelectorAll(".j-grid").forEach(button=>{

        button.addEventListener("click",()=>{
    
            document
                .querySelectorAll(".j-grid")
                .forEach(b=>b.classList.remove("active"));
    
            button.classList.add("active");
    
            JuguemosState.grid=button.dataset.grid;
    
            drawGrid();
    
        });
    
    });

});

function updatePrice(){

    JuguemosAjax.loadPrice(

        JuguemosState.country,

        JuguemosState.mode,

        JuguemosState.quantity

    );

}


function drawGrid(){

    console.log(JuguemosState.grid);

}