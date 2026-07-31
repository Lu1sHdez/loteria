<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="j-libre-upload" style="display:none;" class="j-libre-upload">
    
    <!-- Header -->
    <div class="j-libre-header">
        <p class="text-p-negrita">Libres a escoger</p>
        <p class="j-texto-normal">(54 figuras personalizadas)</p>
    </div>

    <!-- Navegación por grupos -->
    <div class="j-libre-nav">
        <button class="j-libre-nav-btn active" data-group="0">Barajas 1-18</button>
        <button class="j-libre-nav-btn" data-group="1">Barajas 19-36</button>
        <button class="j-libre-nav-btn" data-group="2">Barajas 37-54</button>
    </div>

    <!-- Controles -->
    <div class="j-libre-controls">
        <button type="button" id="j-libre-select-images" class="j-btn-primary" style="background:#FA299C;border-color:#FA299C;font-size:14px;">
            Seleccionar imagenes (54)
        </button>
        <button type="button" id="j-libre-clear-all" class="j-delete">
            Limpiar todo
        </button>
        <span id="j-libre-counter" class="j-libre-counter">0 / 54</span>
    </div>

    <input type="file" id="j-libre-file-input" accept="image/*" multiple style="display:none;">

    <div id="j-libre-grid" class="j-libre-grid"></div>
    <div id="j-libre-status" class="j-libre-status"></div>
</div>
