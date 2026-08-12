<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- Favoritas -->
<div class="j-casilla-option" id="j-favoritas-option" style="display:none;">
    
    <!-- FILA 1: Header + Contador -->
    <div class="j-favoritas-header">
        <div class="contenido-centrado">
            <p class="text-p-negrita">Favoritas a escoger <span class="j-texto-normal"> (hasta 12 figuras)</span></p>
            <span id="j-favoritas-limit-msg">máximo 1 por tabla en Pocitos 3</span>
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
            <div class="j-favoritas-progress-range">
                <input 
                    type="range" 
                    id="j-favoritas-progress-range"
                    min="0" 
                    max="12" 
                    value="0"
                    disabled
                >
                <span class="j-favoritas-progress-number" id="j-favoritas-progress-number">0</span>
            </div>
            <p class="j-texto-normal">Has seleccionado <br> <span class="text-rosa-normal" id="j-favoritas-count"> 0</span > <span class="text-rosa-normal">de</span> <span class="text-rosa-normal">12</span> favoritas</p>

        </div>

        <!-- Columna 2: Ubicación (vertical) -->
        <div class="j-favoritas-col j-favoritas-ubicacion">

            <!-- Añadir estilo directo para eliminar el margen sobrante -->
            <p class="j-ubicacion-titulo" style="margin-bottom: 8px;">Ubicación(es)</p>

            <div class="j-ubicacion-opciones-vertica">
                <button class="j-ubicacion-btn active" data-ubicacion="aleatoria">
                    <span class="j-ubicacion-radio"></span>
                    <img src="/wp-content/uploads/2026/08/fav-aleatoria.png" alt="Aleatoria" class="j-ubicacion-icon-img">
                    <span class="j-ubicacion-texto">Aleatoria</span>
                </button>

                <button class="j-ubicacion-btn" data-ubicacion="centro">
                    <span class="j-ubicacion-radio"></span>
                    <img src="/wp-content/uploads/2026/08/fav-centro.png" alt="Centro" class="j-ubicacion-icon-img">
                    <span class="j-ubicacion-texto">Centro</span>
                </button>

                <button class="j-ubicacion-btn" data-ubicacion="esquinas">
                    <span class="j-ubicacion-radio"></span>
                    <img src="/wp-content/uploads/2026/08/fav-esquinas.png" alt="Esquinas" class="j-ubicacion-icon-img">
                    <span class="j-ubicacion-texto">Esquinas</span>
                </button>

                <button class="j-ubicacion-btn" data-ubicacion="marco">
                    <span class="j-ubicacion-radio"></span>
                    <img src="/wp-content/uploads/2026/08/fav-marco.png" alt="Marco" class="j-ubicacion-icon-img">
                    <span class="j-ubicacion-texto">Marco</span>
                </button>
            </div>
        </div>

        <!-- Columna 3: Botón aleatorio -->
        <div class="j-favoritas-col j-favoritas-accion">
        <button class="j-btn-back" id="j-favoritas-aleatoria">
            <img src="/wp-content/uploads/2026/08/icono-estrella.png" alt="Aleatoria">
            <span>Selección aleatoria</span>
        </button>
            <p class="j-texto-normal sm">El sistema elige 12 cartas. Puedes reemplazar las que no te gusten.</p>
        </div>

    </div>

</div>
