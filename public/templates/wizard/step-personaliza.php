<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<section id="juguemos-personaliza" class="j-step">
    <div class="j-step-header">
        <div class="titulo-seccion-contenedor">
            <img class="destello" src="/wp-content/uploads/2026/07/Destello1.png" alt="">
            <h2 class="titulo-seccion">PERSONALIZA TU LOTERÍA</h2>
            <img class="destello" src="/wp-content/uploads/2026/07/Destello2.png" alt="">
        </div>
    </div>

    <div class="j-step-body">

        <div class="juguemos-left">

            <!-- ============================================= -->
            <!-- SUB-PASO 2.1: Configuración de Tablas + Casillas -->
            <!-- ============================================= -->
            <div class="j-personaliza-sub" data-sub="1">

                <!-- 🔥 SECCIÓN: Configuración de Tablas -->
                <div class="j-section j-section-personaliza">
                    <div class="j-panel-item">
                        <div class="subtitulo-aqua">
                            2. Configuración de Tablas
                        </div>
                    </div>
                    <?php include __DIR__ . '/parts/design-config.php'; ?>
                </div>

                <!-- 🔥 PREVIEW MÓVIL: Ubicación -->
                <div class="j-section j-mobile-preview j-mobile-preview-ubicacion j-section-personaliza">
                    <p class="text-aqua-normal">Vista previa de ubicación</p>
                    <div class="j-preview-ubicacion-wrapper">
                        <div id="j-grid-preview-mobile" class="j-grid-preview j-preview-ubicacion-grid"></div>
                    </div>
                </div>

                <div class="j-section j-section-casillas-definir">
                    <?php include __DIR__ . '/parts/casillas-definir.php'; ?>
                </div>

                <div class="j-section j-mobile-preview j-mobile-preview-casillas j-section-personaliza">
                    <p class="text-aqua-normal">Vista previa casillas</p>
                    <div class="j-preview-casillas-wrapper">
                        <div id="j-casilla-preview-grid-mobile" class="j-casilla-preview-grid j-preview-casillas-grid"></div>
                    </div>
                </div>

                <div class="j-section j-section-botones">
                    <button type="button" id="j-personaliza-back-1" class="j-btn-back">
                        <span>←</span> <span>Regresar</span>
                    </button>
                    <button type="button" id="j-personaliza-next-1" class="j-btn-primary">
                        Siguiente →
                    </button>
                </div>

            </div>

            <!-- ============================================= -->
            <!-- SUB-PASO 2.2: Colores de Marcos y Tablas -->
            <!-- ============================================= -->
            <div class="j-personaliza-sub" data-sub="2" style="display:none;">

                <!-- 🔥 SECCIÓN: Colores -->
                <div class="j-section j-section-personaliza">
                    <div class="j-panel-item">
                        <div class="subtitulo-aqua">
                            3. Colores de Marcos y Tablas
                        </div>
                    </div>
                    <?php include __DIR__ . '/parts/color-style.php'; ?>
                </div>

                <!-- 🔥 PREVIEW MÓVIL: Marcos -->
                <div class="j-section j-mobile-preview j-mobile-preview-marcos j-section-personaliza">
                    <p class="text-aqua-normal">Vista previa marcos</p>
                    <div class="j-preview-marcos-wrapper">
                        <div id="j-marcos-preview-grid-mobile" class="j-marcos-preview-grid j-preview-marcos-grid"></div>
                    </div>
                </div>

                <div class="j-section j-section-botones">
                    <button type="button" id="j-personaliza-back-2" class="j-btn-back">
                        <span>←</span> <span>Regresar</span>
                    </button>
                    <button
                        type="button"
                        id="j-go-preview"
                        class="j-btn-primary">
                        Siguiente →
                    </button>
                </div>

            </div>

        </div>

        <aside class="juguemos-right">
            <div class="preview-card">

                <!-- Solo visibles en sub-paso 1 -->
                <div class="j-preview-section j-preview-ubicacion-section j-personaliza-preview" data-sub="1">
                    <p class="text-aqua-normal j-preview-ubicacion-title">Vista previa de ubicación</p>
                    <div class="j-preview-ubicacion-wrapper">
                        <div id="j-grid-preview" class="j-grid-preview j-preview-ubicacion-grid"></div>
                    </div>
                </div>

                <div class="j-preview-section j-preview-casillas-section j-personaliza-preview" data-sub="1">
                    <p class="text-aqua-normal j-preview-casillas-title">Vista previa casillas</p>
                    <div class="j-preview-casillas-wrapper">
                        <div id="j-casilla-preview-grid" class="j-casilla-preview-grid j-preview-casillas-grid"></div>
                    </div>
                </div>

                <!-- Solo visible en sub-paso 2 -->
                <div class="j-preview-section j-preview-marcos-section j-personaliza-preview" data-sub="2" style="display:none;">
                    <p class="text-aqua-normal j-preview-marcos-title">Vista previa marcos</p>
                    <div class="j-preview-marcos-wrapper">
                        <div id="j-marcos-preview-grid" class="j-marcos-preview-grid j-preview-marcos-grid"></div>
                    </div>
                </div>

            </div>
        </aside>

    </div>

</section>

<script>
document.addEventListener('DOMContentLoaded', function() {

    var stepDesign = document.getElementById('juguemos-design');
    var stepPersonaliza = document.getElementById('juguemos-personaliza');
    var sub1 = stepPersonaliza ? stepPersonaliza.querySelector('.j-personaliza-sub[data-sub="1"]') : null;
    var sub2 = stepPersonaliza ? stepPersonaliza.querySelector('.j-personaliza-sub[data-sub="2"]') : null;
    var previewSub1 = stepPersonaliza ? stepPersonaliza.querySelectorAll('.j-personaliza-preview[data-sub="1"]') : [];
    var previewSub2 = stepPersonaliza ? stepPersonaliza.querySelectorAll('.j-personaliza-preview[data-sub="2"]') : [];

    function mostrarSubPaso(sub) {
        if (sub1) sub1.style.display = (sub === 1) ? '' : 'none';
        if (sub2) sub2.style.display = (sub === 2) ? '' : 'none';

        previewSub1.forEach(function(el) { el.style.display = (sub === 1) ? '' : 'none'; });
        previewSub2.forEach(function(el) { el.style.display = (sub === 2) ? '' : 'none'; });

        // Refrescar las vistas previas móviles al cambiar de pantalla
        if (typeof window.syncMobilePreviews === 'function') {
            setTimeout(window.syncMobilePreviews, 50);
        }
    }

    function mostrarPersonaliza(sub) {
        document.querySelectorAll('.j-step').forEach(function(s) { s.classList.remove('active'); });
        stepPersonaliza.classList.add('active');

        document.querySelectorAll('.juguemos-step').forEach(function(s) { s.classList.remove('active'); });
        var stepHeader = document.querySelector('.juguemos-step[data-step="2"]');
        if (stepHeader) stepHeader.classList.add('active');

        mostrarSubPaso(sub || 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Paso 1 → Paso 2 (sub 1)
    var btnGoPersonaliza = document.getElementById('j-go-personaliza');
    if (btnGoPersonaliza) {
        btnGoPersonaliza.addEventListener('click', function() {
            var categoriaActiva = document.querySelector('.j-category.active');
            var esPersonalizadas = categoriaActiva && 
                categoriaActiva.textContent.trim().toLowerCase() === 'personalizadas';
            
            if (!esPersonalizadas && !JuguemosState.deck) {
                alert('Selecciona un diseño de lotería primero.');
                return;
            }
            
            mostrarPersonaliza(1);
            setTimeout(function() {
                if (typeof actualizarModosPorCategoria === 'function') {
                    actualizarModosPorCategoria();
                }
            }, 100);
        });
    }

    // Sub 1 → Sub 2
    var btnNext1 = document.getElementById('j-personaliza-next-1');
    if (btnNext1) {
        btnNext1.addEventListener('click', function() {
            mostrarSubPaso(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Sub 2 → Sub 1
    var btnBack2 = document.getElementById('j-personaliza-back-2');
    if (btnBack2) {
        btnBack2.addEventListener('click', function() {
            mostrarSubPaso(1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Sub 1 → Paso 1 (Estilo de lotería)
    var btnBack1 = document.getElementById('j-personaliza-back-1');
    if (btnBack1) {
        btnBack1.addEventListener('click', function() {
            document.querySelectorAll('.j-step').forEach(function(s) { s.classList.remove('active'); });
            stepDesign.classList.add('active');

            document.querySelectorAll('.juguemos-step').forEach(function(s) { s.classList.remove('active'); });
            var stepHeader = document.querySelector('.juguemos-step[data-step="1"]');
            if (stepHeader) stepHeader.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    window.JuguemosMostrarPersonaliza = mostrarPersonaliza;
});
</script>
