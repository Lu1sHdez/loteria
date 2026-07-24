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
                <p class="j-texto-normal">
                    Así se imprimirán tus tablas de lotería.
                </p>
            </div>
            
            <!-- NUEVO: Botón actualizar -->
            <button id="j-refresh-preview" class="j-btn-refresh" style="
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 16px;
                background: #24B8C8;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(36, 184, 200, 0.3);
            ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 0.5s ease;">
                    <polyline points="23 4 23 10 17 10"></polyline>
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                </svg>
                <span>Actualizar vista</span>
            </button>
        </div>

        <!-- Información de configuración actual -->
        <div class="j-preview-info" style="margin-top: 10px; padding: 12px; background: #f0f9fa; border-left: 4px solid #24B8C8; border-radius: 4px; font-size: 13px; color: #555;">
            <span style="font-weight: 600;">📐 Configuración:</span>
            <span id="j-preview-config">
                <?php 
                // Valores por defecto
                $paper = isset($_SESSION['juguemos_paper']) ? $_SESSION['juguemos_paper'] : 'carta';
                $orientation = isset($_SESSION['juguemos_orientation']) ? $_SESSION['juguemos_orientation'] : 'vertical';
                $quantity = isset($_SESSION['juguemos_quantity']) ? $_SESSION['juguemos_quantity'] : 4;
                $grid = isset($_SESSION['juguemos_grid']) ? $_SESSION['juguemos_grid'] : '4x4';
                ?>
                Papel: <strong><?php echo esc_html(ucfirst($paper)); ?></strong> | 
                Orientación: <strong><?php echo esc_html($orientation); ?></strong> | 
                Tablas: <strong><?php echo esc_html($quantity); ?></strong> | 
                Grid: <strong><?php echo esc_html($grid); ?></strong>
            </span>
            <span id="j-last-update" style="margin-left: 15px; font-size: 11px; color: #999;">
                Última actualización: <span id="j-update-time">--:--:--</span>
            </span>
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
                <div style="font-size: 48px; margin-bottom: 15px;">📋</div>
                <h3 style="color: #333; margin-bottom: 8px;">Configura tu pedido</h3>
                <p style="color: #888; max-width: 400px; margin: 0 auto;">
                    Selecciona la cantidad de tablas, el diseño y las barajas para ver la vista previa.
                </p>
            </div>

        </div>

    </div>

</div>

<style>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

#j-print-preview {
    min-height: 300px;
    transition: all 0.3s ease;
}

.j-sheet {
    background: white;
    border: 2px solid #ddd;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    position: relative;
    margin: 0 auto;
    border-radius: 2px;
}

.j-sheet-content {
    width: 100%;
    height: 100%;
    padding: 15px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
}

.j-print-board {
    transition: all 0.2s ease;
}

.j-print-board:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.j-board-cell {
    transition: all 0.2s ease;
}

.j-board-cell:hover {
    transform: scale(1.02);
    z-index: 2;
}

.j-cut-marks {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

/* Botón refresh */
.j-btn-refresh:hover {
    background: #1d9ba8 !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(36, 184, 200, 0.4) !important;
}

.j-btn-refresh:active {
    transform: translateY(0px);
    box-shadow: 0 2px 4px rgba(36, 184, 200, 0.2) !important;
}

.j-btn-refresh.refreshing svg {
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Scroll suave */
.j-print-preview-wrapper {
    overflow: auto;
    max-height: 90vh;
}

/* Responsive */
@media (max-width: 768px) {
    .j-sheet {
        transform: scale(0.7);
        transform-origin: top center;
    }
    
    .j-print-preview-wrapper {
        padding: 10px !important;
    }

    .j-panel-header {
        flex-direction: column;
        align-items: flex-start !important;
    }

    .j-btn-refresh {
        width: 100%;
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .j-sheet {
        transform: scale(0.5);
        transform-origin: top center;
    }
}
</style>

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
                    
                    // Feedback visual
                    this.style.background = '#2ecc71';
                    setTimeout(() => {
                        this.style.background = '#24B8C8';
                    }, 800);
                }, 300);
            } else {
                console.warn('⚠️ PrintPaper no está disponible');
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


