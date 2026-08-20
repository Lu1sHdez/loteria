/**
 * =====================================================
 * MOBILE PREVIEWS - Sincronización optimizada (sin parpadeos)
 * =====================================================
 */

(function() {
    'use strict';

    // Guardar el último HTML para comparar
    var lastHtml = {
        design: '',
        ubicacion: '',
        casillas: '',
        marcos: ''
    };

    /**
     * Sincroniza las previews originales con las móviles SOLO si cambiaron
     */
    function syncMobilePreviews() {
        // Diseño
        var designOriginal = document.getElementById('deck-preview');
        var designMobile = document.getElementById('deck-preview-mobile');
        if (designOriginal && designMobile) {
            var htmlDesign = designOriginal.innerHTML;
            if (lastHtml.design !== htmlDesign) {
                designMobile.innerHTML = htmlDesign;
                lastHtml.design = htmlDesign;
            }
        }

        // Ubicación
        var ubicacionOriginal = document.getElementById('j-grid-preview');
        var ubicacionMobile = document.getElementById('j-grid-preview-mobile');
        if (ubicacionOriginal && ubicacionMobile) {
            var htmlUbicacion = ubicacionOriginal.innerHTML;
            if (lastHtml.ubicacion !== htmlUbicacion) {
                ubicacionMobile.innerHTML = htmlUbicacion;
                ubicacionMobile.className = ubicacionOriginal.className;
                ubicacionMobile.dataset.grid = ubicacionOriginal.dataset.grid;
                lastHtml.ubicacion = htmlUbicacion;
            }
        }

        // Casillas
        var casillasOriginal = document.getElementById('j-casilla-preview-grid');
        var casillasMobile = document.getElementById('j-casilla-preview-grid-mobile');
        if (casillasOriginal && casillasMobile) {
            var htmlCasillas = casillasOriginal.innerHTML;
            if (lastHtml.casillas !== htmlCasillas) {
                casillasMobile.innerHTML = htmlCasillas;
                casillasMobile.className = casillasOriginal.className;
                casillasMobile.dataset.grid = casillasOriginal.dataset.grid;
                lastHtml.casillas = htmlCasillas;
            }
        }

        // Marcos
        var marcosOriginal = document.getElementById('j-marcos-preview-grid');
        var marcosMobile = document.getElementById('j-marcos-preview-grid-mobile');
        if (marcosOriginal && marcosMobile) {
            var htmlMarcos = marcosOriginal.innerHTML;
            if (lastHtml.marcos !== htmlMarcos) {
                marcosMobile.innerHTML = htmlMarcos;
                marcosMobile.className = marcosOriginal.className;
                marcosMobile.dataset.grid = marcosOriginal.dataset.grid;
                lastHtml.marcos = htmlMarcos;
            }
        }
    }

    // ==========================================
    // INICIALIZAR
    // ==========================================

    document.addEventListener('DOMContentLoaded', function() {
        // Primera sincronización
        setTimeout(syncMobilePreviews, 100);

        // Sincronizar solo cuando haya cambios (no cada 500ms)
        var resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(syncMobilePreviews, 300);
        });

        // También sincronizar cuando cambie el grid (eventos personalizados)
        document.addEventListener('gridChanged', function() {
            setTimeout(syncMobilePreviews, 50);
        });
    });

    // Exponer función para que pueda ser llamada desde otros scripts
    window.syncMobilePreviews = syncMobilePreviews;

})();
