<div class="j-quantity">

    <p class="text-p-negrita">Número de tablas por hoja</p>

    <div class="j-quantity-controls-wrapper">

        <!-- RANGO -->
        <div class="j-quantity-controls-range">
            <input
                id="tables-range"
                type="range"
                min="1"
                max="30"
                value="18">
        </div>


        
        <!-- INPUT NUMÉRICO CON BOTONES + / - -->
        <div class="j-quantity-controls-number">
            <button type="button" class="j-number-btn minus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>

            <input
                id="tables-number"
                type="number"
                min="1"
                max="30"
                value="18">

            <button type="button" class="j-number-btn plus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6H10M6 2V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>

    </div>

</div>


<p class="text-p-negrita">Número de casillas por tabla</p>

<div class="j-grids">

    <button class="j-grid active" data-grid="4x4">
        4x4
        <span>16 casillas</span>
    </button>

    <button class="j-grid" data-grid="5x5">
        5x5
        <span>25 casillas</span>
    </button>

    <button class="j-grid" data-grid="pocitos4">
        Pocitos 4
        <span>4 casillas</span>
    </button>

    <button class="j-grid" data-grid="pocitos3">
        Pocitos 3
        <span>3 casillas</span>
    </button>

    <button class="j-grid" data-grid="cruzadas">
        Cruzadas
        <span>2 diagonales</span>
    </button>

</div>

<p class="text-p-negrita">Tipo de tablas</p>


<div class="j-modes">

    <button class="j-mode active" data-mode="sencilla">
        Sencilla
    </button>

    <button class="j-mode" data-mode="dobles">
        Dobles
    </button>

    <button class="j-mode" data-mode="favoritas">
        Favoritas
    </button>

    <button class="j-mode" data-mode="libre">
        Libre
    </button>

</div>

