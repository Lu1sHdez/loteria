<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<section id="juguemos-design" class="j-step active">
    <div class="j-step-header">
        <div class="titulo-seccion-contenedor">
            <img class="destello" src="/wp-content/uploads/2026/07/Destello1.png" alt="">
            <h2 class="titulo-seccion">PERSONALIZA TU LOTERÍA</h2>
            <img class="destello" src="/wp-content/uploads/2026/07/Destello2.png" alt="">
        </div>
    </div>

    <div class="j-step-body">

        <div class="juguemos-left">

            <!-- ========================= -->
            <!-- 1. Estilo de barajas -->
            <!-- ========================= -->
            <div class="j-section j-section-estilo-loteria">

                <div class="j-panel-item">
                    <div class="subtitulo-aqua">
                        1. Estilo de loteria
                    </div>
                </div>

                <?php include __DIR__ . '/parts/design-categories.php'; ?>

                <div class="j-toggle-barajas-wrapper">
                    <button type="button" id="j-incluir-barajas" class="j-toggle-barajas inactive">
                        <span class="j-toggle-circle">
                            <img id="j-toggle-icon" src="/wp-content/uploads/2026/07/incluir_on.png" alt="Incluir barajas">
                        </span>
                        <span class="j-toggle-text">Incluir barajas</span>
                    </button>
                </div>

                <div id="j-incluir-status" class="j-incluir-status inactive">
                    Barajas incluidas en el diseño
                </div>
            </div>

            <div class="j-section j-mobile-preview j-mobile-preview-design">
                <p class="text-aqua-normal">Vista previa de diseño</p>
                <div id="deck-preview-mobile" class="j-preview-design-container">
                    <?php include __DIR__ . '/parts/skeleton-design.php'; ?>
                </div>
            </div>

            

        </div>

        <aside class="juguemos-right">
            <div class="preview-card">
                <div class="j-preview-section j-preview-design-section">
                    <p class="text-aqua-normal j-preview-design-title">Vista previa de diseño</p>
                    <div id="deck-preview" class="j-preview-design-container">
                        <?php include __DIR__ . '/parts/skeleton-design.php'; ?>
                    </div>
                </div>
            </div>
        </aside>

    </div>
    
    <div class="j-section j-section-next">
        <button
            type="button"
            id="j-go-personaliza"
            class="j-btn-primary">
            Siguiente →
        </button>
    </div>

</section>
