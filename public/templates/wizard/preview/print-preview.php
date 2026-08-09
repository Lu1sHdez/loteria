<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<!-- ==========================================
3. Vista previa de impresión
========================================== -->

<div class="j-section">

    <div class="j-panel-item">

        <div class="j-panel-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
            <div>
                <div class="subtitulo-aqua">
                    3. Vista previa de impresión
                </div>

            </div>
            
            <!-- NUEVO: Botón actualizar -->
            <button id="j-refresh-preview" class="j-baraja-update">
                <svg class="j-refresh-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span>Actualizar vista</span>
            </button>
        </div>

            <div class="j-order-summary">

                <p class="j-order-summary-title">
                    Tu lotería incluye:
                </p>

                <div class="j-order-summary-items">

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/tablas.png" alt="Tablas" class="j-chip-icon-img">
                        <span id="j-summary-tables"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/baraja.png" alt="Barajas" class="j-chip-icon-img">
                        <span id="j-summary-cards"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/Papel.png" alt="Papel" class="j-chip-icon-img">
                        <span id="j-summary-paper"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/Orientacion.png" alt="Orientación" class="j-chip-icon-img">
                        <span id="j-summary-orientation"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/paginas.png" alt="Páginas" class="j-chip-icon-img">
                        <span id="j-summary-pages"></span>
                    </div>

                    <div class="j-summary-chip">
                        <span id="j-summary-grid"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/baraja_corazon.png" alt="Modo" class="j-chip-icon-img">
                        <span id="j-summary-mode"></span>
                    </div>

                    <div class="j-summary-chip">
                        <img src="/wp-content/uploads/2026/08/Marcas_corte.png" alt="Marcas de corte" class="j-chip-icon-img">
                        <span id="j-summary-cutmarks"></span>
                    </div>

                </div>
            </div>
    </div>

    <div class="j-print-preview-wrapper" style="padding: 20px; background: #f5f5f5; border-radius: 8px; min-height: 400px;">

        <!-- Contenedor donde JavaScript renderizará -->
        <div id="j-print-preview" style="display: flex; flex-direction: column; align-items: center; gap: 30px; padding: 20px;">
            
            <!-- Estado de carga -->
            <div id="j-preview-loading" style="display: flex; flex-direction: column; align-items: center; padding: 60px 20px;">
                <div style="width: 40px; height: 40px; border: 4px solid #e0e0e0; border-top: 4px solid #24B8C8; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 15px; color: #888;">Generando vista previa...</p>
            </div>

            <!-- Estado vacío -->
            <div id="j-preview-empty" style="display: none; text-align: center; padding: 60px 20px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                <h3 style="color: #333; margin-bottom: 8px;">Configura tu pedido</h3>
                <p style="color: #888; max-width: 400px; margin: 0 auto;">
                    Selecciona la cantidad de tablas, el diseño y las barajas para ver la vista previa.
                </p>
            </div>

        </div>

    </div>

</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('j-print-preview');
    const loading = document.getElementById('j-preview-loading');
    const empty = document.getElementById('j-preview-empty');
    const refreshBtn = document.getElementById('j-refresh-preview');
    const updateTime = document.getElementById('j-update-time');

    // Función para actualizar el estado de la vista previa
    window.updatePreviewState = function(state) {
        if (loading) loading.style.display = 'none';
        if (empty) empty.style.display = 'none';
        
        if (state === 'loading') {
            if (loading) loading.style.display = 'flex';
        } else if (state === 'empty') {
            if (empty) empty.style.display = 'block';
        } else if (state === 'ready') {
            // Todo listo
        }
    };

    // Función para actualizar la hora
    window.updateTimestamp = function() {
        if (updateTime) {
            const now = new Date();
            const time = now.toLocaleTimeString('es-MX', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
            });
            updateTime.textContent = time;
        }
    };

    // BOTÓN ACTUALIZAR
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            // Añadir clase para animación
            this.classList.add('refreshing');
            
            // Cambiar texto temporalmente
            const originalText = this.querySelector('span').textContent;
            this.querySelector('span').textContent = 'Actualizando...';
            
            // Forzar refresh
            if (typeof PrintPaper !== 'undefined') {
                window.updatePreviewState('loading');
                
                setTimeout(() => {
                    PrintPaper.refresh();
                    window.updateTimestamp();
                    window.updatePreviewState('ready');

                    // Restaurar botón
                    this.classList.remove('refreshing');
                    this.querySelector('span').textContent = originalText;

                }, 300);
            } else {
                console.warn('PrintPaper no está disponible');
                this.classList.remove('refreshing');
                this.querySelector('span').textContent = originalText;
            }
        });
    }

    // Mostrar loading inicial
    window.updatePreviewState('loading');

    // Escuchar cambios en JuguemosState
    if (typeof JuguemosState !== 'undefined') {
        // Actualizar info de configuración
        const configDisplay = document.getElementById('j-preview-config');
        
        function updateConfigInfo() {
            if (configDisplay) {
                const paper = JuguemosState.paper || 'carta';
                const orientation = JuguemosState.orientation || 'vertical';
                const quantity = JuguemosState.quantity || 4;
                const grid = JuguemosState.grid || '4x4';
                const pages = JuguemosState.pages || 1;
                const cutMarks = JuguemosState.cutMarks ? 'Sí' : 'No';
                
                configDisplay.innerHTML = `
                    Papel: <strong>${paper.charAt(0).toUpperCase() + paper.slice(1)}</strong> | 
                    Orientación: <strong>${orientation}</strong> | 
                    Tablas: <strong>${quantity}</strong> | 
                    Grid: <strong>${grid}</strong> | 
                    Páginas: <strong>${pages}</strong> |
                    Marcas de corte: <strong>${cutMarks}</strong>
                `;
            }
            window.updateTimestamp();
        }

        // Actualizar cuando cambie el estado
        const originalUpdateOrderSummary = window.updateOrderSummary;
        if (originalUpdateOrderSummary) {
            window.updateOrderSummary = function() {
                originalUpdateOrderSummary();
                updateConfigInfo();
            };
        }

        // Configuración inicial
        setTimeout(() => {
            updateConfigInfo();
            window.updateTimestamp();
        }, 100);
    }

    console.log('Print Preview PHP: Cargado correctamente');
});
</script>
