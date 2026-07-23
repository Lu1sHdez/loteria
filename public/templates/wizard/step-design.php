<?php
if (!defined('ABSPATH')) {
    exit;
}
?>


<section id="juguemos-design" class="j-step active">
    <div class="j-step-header">
        <div class="titulo-seccion-contenedor">
            <img
                class="destello"
                src="/wp-content/uploads/2026/07/Destello1.png"
                alt="">

            <h2 class="titulo-seccion">
                PERSONALIZA TU LOTERÍA
            </h2>

            <img
                class="destello"
                src="/wp-content/uploads/2026/07/Destello2.png"
                alt="">
        </div>
    </div>

    <div class="j-step-body">

        <div class="juguemos-left">

            

            <!-- ========================= -->
            <!-- 1. Estilo de barajas -->
            <!-- ========================= -->

            <div class="j-section">

                <div class="j-panel-item">
                    <div class="subtitulo-aqua">
                        1. Estilo de barajas
                    </div>
                </div>

                <?php include __DIR__ . '/parts/design-categories.php'; ?>

                <button
                    type="button"
                    id="j-incluir-barajas"
                    class="j-btn-incluir-barajas active">
                    Incluir barajas
                </button>

                <div id="j-incluir-status" class="j-incluir-status active">
                    Barajas incluidas en el diseño
                </div>

            </div>

            <!-- ========================= -->
            <!-- 2. Configuración de Tablas -->
            <!-- ========================= -->

            <div class="j-section">

                <div class="j-panel-item">
                    <div class="subtitulo-aqua">
                        2. Configuración de Tablas
                    </div>
                </div>

                <?php include __DIR__ . '/parts/design-config.php'; ?>

            </div>

            
            <div class="j-section">
                <?php include __DIR__ . '/parts/casillas-definir.php'; ?>

            </div>


            <div class="j-section">
                <div class="j-panel-item">
                    <div class="subtitulo-aqua">
                        3. Color y Estilo
                    </div>
                </div>
                <?php include __DIR__ . '/parts/color-style.php'; ?>

            </div>

            <div class="j-section j-section-next">
            <button
                type="button"
                id="j-go-preview"
                class="j-btn-primary">
                Siguiente: Vista Previa →
            </button>
            </div>

        </div>
        <aside class="juguemos-right">
            <?php include __DIR__ . '/parts/preview-card.php'; ?>
        </aside>
    </div>

    

</section>