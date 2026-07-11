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
        <!-- 1 -->
        <!-- ========================= -->

        <div class="j-section">

            <h3>
                1. Estilo de Baraja
            </h3>

            <?php
            include __DIR__ . '/parts/design-categories.php';
            ?>

        </div>


        <!-- ========================= -->
        <!-- 2 -->
        <!-- ========================= -->

        <div class="j-section">

            <h3>
                2. Configuración de Tablas
            </h3>

            <?php
            include __DIR__ . '/parts/design-config.php';
            ?>

        </div>

    </div>


    <aside class="juguemos-right">

        <?php
        include __DIR__ . '/parts/preview-card.php';
        ?>

    </aside>

</section>