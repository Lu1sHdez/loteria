<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<section id="juguemos-design" class="j-step active">

    <div class="juguemos-left">

        <div class="titulo-seccion-contenedor">
            <img
                class="destello"
                src="http://loteria-la-dama.local/wp-content/uploads/2026/07/Destello1.png"
                alt="">

            <h2 class="titulo-seccion">
                CÓMO FUNCIONA
            </h2>

            <img
                class="destello"
                src="http://loteria-la-dama.local/wp-content/uploads/2026/07/Destello2.png"
                alt="">
        </div>

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

    </div>

    <aside class="juguemos-right">
        <?php include __DIR__ . '/parts/preview-card.php'; ?>
    </aside>

</section>