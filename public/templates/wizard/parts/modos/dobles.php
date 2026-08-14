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
                <img src="/wp-content/uploads/2026/08/Dob-Aleatoria.png" alt="Aleatorio" class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Aleatorio</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-Centro.png" alt="Centro" class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Centro</span>
            </label>
        </div>
        
        <!-- Fila 2 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="contra-esquina-der-izq">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-Contra-E-Der-Izq.png" alt="Contra esquina der. a izq." class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Contra esquina der. a izq.</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="contra-esquina-izq-der">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-Contra-E-Izq-Der.png" alt="Contra esquina izq. a der." class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Contra esquina izq. a der.</span>
            </label>
        </div>
        
        <!-- Fila 3 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-horizontal">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-centro-horizontal.png" alt="Centro - Horizontal" class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Centro - Horizontal</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-vertical">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-centro-vertical.png" alt="Centro - Vertical" class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Centro - Vertical</span>
            </label>
        </div>
        
        <!-- Fila 4 -->
        <div class="j-ubicacion-row">
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-diagonal-der-izq">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-Diag-C-Der-Izq.png" alt="Centro - Diagonal Der. a Izq." class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Centro - Diagonal Der. a Izq.</span>
            </label>
            
            <label class="j-ubicacion-radio">
                <input type="radio" class="j-ubicacion-radio-input" name="ubicacion-doble" data-ubicacion="centro-diagonal-izq-der">
                <span class="j-radio-custom"></span>
                <img src="/wp-content/uploads/2026/08/Dob-Diag-C-Izq-Der.png" alt="Centro - Diagonal Izq. a Der." class="j-ubicacion-icon" loading="lazy">
                <span class="j-ubicacion-label">Centro - Diagonal Izq. a Der.</span>
            </label>
        </div>
        
    </div>
    
    <!-- MENSAJE INFORMATIVO - SIN FONDO -->
    <p class="j-ubicacion-mensaje">
        <span class="j-destacado">✨ Selección Aleatoria</span>
        <span class="j-texto-aqua sm">: el sistema elegirá aleatoriamente todas tus casillas dobles de tus tablas.</span>
    </p>

</div>
