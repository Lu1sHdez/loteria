<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- ==========================================
     DOBLES - CONTROLES DE UBICACIÓN
     ========================================== -->
<div class="j-casilla-option" id="j-dobles-option">
    
    <!-- TÍTULO -->
    <p class="text-p-negrita">Ubicación por definir</p>
    
    <!-- RADIO BUTTONS DE UBICACIÓN (SOLO UNO SELECCIONABLE) -->
    <div class="j-ubicacion-radios">
        
        <!-- Fila 1 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="aleatoria" checked>
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Aleatorio</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Centro</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="contra-esquina-der-izq">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Contra esquina der. a izq.</span>
            </label>
        </div>
        
        <!-- Fila 2 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="contra-esquina-izq-der">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Contra esquina izq. a der.</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-diagonal-der-izq">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Centro - Diagonal Der. a Izq.</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-diagonal-izq-der">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Centro - Diagonal Izq. a Der.</span>
            </label>
        </div>
        
        <!-- Fila 3 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-horizontal">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Centro - Horizontal</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-vertical">
                <span class="j-radio-custom"></span>
                <span class="j-ubicacion-label">Centro - Vertical</span>
            </label>
        </div>
        
    </div>
    
    <!-- MENSAJE INFORMATIVO - SIN FONDO -->
    <p class="j-ubicacion-mensaje">
        <span class="j-destacado">✨ Selección Aleatoria</span>
        <span class="j-texto-aqua">: el sistema elegirá aleatoriamente todas tus casillas dobles de tus tablas.</span>
    </p>

</div>
