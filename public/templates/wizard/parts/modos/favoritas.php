<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- Favoritas -->
<div class="j-casilla-option" id="j-favoritas-option" style="display:none;">
    
    <!-- FILA 1: Header + Contador -->
    <div class="j-favoritas-header">
        <div>
            <p class="text-p-negrita">Favoritas a escoger</p>
            <p class="j-texto-normal">(hasta 12 figuras)</p>
        </div>
        <div class="j-favoritas-counter-circle" id="j-favoritas-counter-circle">
            <span id="j-favoritas-seleccionadas">0</span>
            <span class="j-counter-separator">/</span>
            <span>12</span>
        </div>
    </div>

    <!-- FILA 2: Categorías -->
    <div class="j-favoritas-categorias" id="j-favoritas-categorias">
        <!-- Se generan dinámicamente con JS -->
    </div>

    <!-- FILA 3: Grid de barajas (ocupa todo el ancho) -->
    <div class="j-favoritas-grid-wrapper">
        <div class="j-favoritas-grid" id="j-favoritas-grid">
            <!-- Se generan dinámicamente con JS -->
        </div>
    </div>

    <!-- FILA 4: 3 COLUMNAS HORIZONTALES -->
    <div class="j-favoritas-row">
        
        <!-- Columna 1: Progreso -->
        <div class="j-favoritas-col j-favoritas-progress">
            <p class="text-p-negrita">Has seleccionado <span id="j-favoritas-count">0</span> de 12 favoritas</p>
            <div class="j-favoritas-progress-range">
                <input 
                    type="range" 
                    id="j-favoritas-progress-range"
                    min="0" 
                    max="12" 
                    value="0"
                    readonly
                >
                <span class="j-favoritas-progress-number" id="j-favoritas-progress-number">0</span>
            </div>
        </div>

        <!-- Columna 2: Ubicación (vertical) -->
        <div class="j-favoritas-col j-favoritas-ubicacion">
            <p class="text-p-negrita">Ubicación de favoritas</p>
            <div class="j-ubicacion-opciones-vertical">
                <button class="j-ubicacion-btn active" data-ubicacion="aleatoria">Aleatoria</button>
                <button class="j-ubicacion-btn" data-ubicacion="centro">Centro</button>
                <button class="j-ubicacion-btn" data-ubicacion="esquinas">Esquinas</button>
                <button class="j-ubicacion-btn" data-ubicacion="marco">Marco</button>
            </div>
        </div>

        <!-- Columna 3: Botón aleatorio -->
        <div class="j-favoritas-col j-favoritas-accion">
            <button class="j-casilla-btn" id="j-favoritas-aleatoria">
                Selección aleatoria
            </button>
            <p class="j-texto-normal">El sistema elige 12 cartas. Puedes reemplazar las que no te gusten.</p>
        </div>

    </div>

</div>
