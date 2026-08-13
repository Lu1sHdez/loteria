<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="j-libre-upload" style="display:none;" class="j-libre-upload">
    
    <!-- Header con contador -->
    <div class="j-libre-header">
        <div class="contenido-centrado">
            <p class="text-p-negrita">Personalizadas <span class="j-texto-normal">(54 figuras personalizadas)</span>   </p>
        </div>
        <span class="j-libre-counter" id="j-libre-counter">
            <span id="j-libre-seleccionadas">0</span>
            <span class="j-counter-separator">/</span>
            <span>54</span>
        </span>
    </div>
    <p class="j-texto-normal">Cada imagen debe estar en formato JPEG (.jpg / .jpeg) y tener un peso máximo de 2 MB por baraja. </p>

    <!-- Controles -->
    <div class="j-libre-controls">
        <button type="button" id="j-libre-select-images" class="j-btn-primary">
            Seleccionar imágenes (54)
        </button>
        <button type="button" id="j-libre-clear-all" class="j-btn-primary-delete">
            Borrar todo
        </button>
    </div>

    <!-- Navegación por grupos -->
    <div class="j-libre-nav">
        <button class="j-libre-nav-btn active" data-group="0">Barajas 1-18</button>
        <button class="j-libre-nav-btn" data-group="1">Barajas 19-36</button>
        <button class="j-libre-nav-btn" data-group="2">Barajas 37-54</button>
    </div>

    <input type="file" id="j-libre-file-input" accept="image/*" multiple style="display:none;">

    <div id="j-libre-grid" class="j-libre-grid"></div>
    <div id="j-libre-status" class="j-libre-status"></div>
</div>
