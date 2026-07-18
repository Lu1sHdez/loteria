<div class="preview-card">

    <div class="j-preview-section">
        <p class="text-aqua-normal">Vista previa de diseño</p>
        <div id="deck-preview">
            Selecciona una baraja
        </div>
    </div>

    <div class="j-preview-section">
        <p class="text-aqua-normal">Vista previa de ubicación</p>
        <div class="j-preview-grid-wrapper">
            <div id="j-grid-preview" class="j-grid-preview">
                <!-- Se genera dinámicamente con JS -->
            </div>
        </div>
    </div>

    <div class="j-preview-section">
        <p class="text-aqua-normal">Vista previa casillas</p>
        <div class="j-preview-casillas-wrapper">
            <div id="j-casilla-preview-grid" class="j-casilla-preview-grid">
                <!-- Se genera dinámicamente con JS -->
            </div>
        </div>
    </div>

    <div class="j-preview-section">
        <p class="text-aqua-normal">Vista previa marcos</p>
        <div class="j-preview-marcos-wrapper">
            <div id="j-marcos-preview-grid" class="j-marcos-preview-grid">
                <!-- Se genera dinámicamente con JS -->
            </div>
        </div>
    </div>


    <?php
    include __DIR__ . '/order-summary.php';
    ?>

</div>