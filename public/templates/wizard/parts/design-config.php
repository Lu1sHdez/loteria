<div class="j-quantity">

    <p class="text-p-negrita">Número de tablas por hoja</p>

    <div class="j-quantity-controls-wrapper">

        <!-- RANGO -->
        <div class="j-quantity-controls-range">
            <input
                id="tables-range"
                type="range"
                min="1"
                max="30"
                value="1">
        </div>


        
        <!-- INPUT NUMÉRICO CON BOTONES + / - -->
        <div class="j-quantity-controls-number">
            <button type="button" class="j-number-btn minus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6H10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>

            <input
                id="tables-number"
                type="number"
                min="1"
                max="30"
                value="1">

            <button type="button" class="j-number-btn plus">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6H10M6 2V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            </button>
        </div>

    </div>

</div>


<p class="text-p-negrita">Número de casillas por tabla</p>

<div class="j-grids">

    <button class="j-grid active" data-grid="4x4">
        4x4
        <span>16 casillas</span>
    </button>

    <button class="j-grid" data-grid="5x5">
        5x5
        <span>25 casillas</span>
    </button>

    <button class="j-grid" data-grid="pocitos4">
        Pocitos 4
        <span>4 casillas</span>
    </button>

    <button class="j-grid" data-grid="pocitos3">
        Pocitos 3
        <span>3 casillas</span>
    </button>

    <button class="j-grid" data-grid="cruzadas">
        Cruzadas
        <span >2 diagonales</span>
    </button>

</div>

<p class="text-p-negrita">Tipo de tablas</p>

<div class="j-modes">
    <button class="j-mode active" data-mode="sencilla" id="j-mode-sencilla">
        <img class="j-mode-icon" src="/wp-content/uploads/2026/08/sencilla-on.png" alt="Sencilla">
        Sencilla
    </button>

    <button class="j-mode" data-mode="dobles" id="j-mode-dobles">
        <img class="j-mode-icon" src="/wp-content/uploads/2026/08/Dobles-off.png" alt="Dobles">
        Dobles
    </button>

    <button class="j-mode" data-mode="favoritas" id="j-mode-favoritas">
        <img class="j-mode-icon" src="/wp-content/uploads/2026/08/favoritas-off.png" alt="Favoritas">
        Favoritas
    </button>

    <button class="j-mode" data-mode="libre" id="j-mode-libre">
        <img class="j-mode-icon" src="/wp-content/uploads/2026/08/libres-off.png" alt="Personalizadas">
        Personalizadas
    </button>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const modeButtons = document.querySelectorAll('.j-mode');
    const doblesBtn = document.getElementById('j-mode-dobles');
    const libreBtn = document.getElementById('j-mode-libre');
    const gridButtons = document.querySelectorAll('.j-grid');
    
    // Rutas de los iconos
    const iconPaths = {
        'sencilla': {
            on: '/wp-content/uploads/2026/08/sencilla-on.png',
            off: '/wp-content/uploads/2026/08/sencilla-off.png'
        },
        'dobles': {
            on: '/wp-content/uploads/2026/08/Dobles-on.png',
            off: '/wp-content/uploads/2026/08/Dobles-off.png'
        },
        'favoritas': {
            on: '/wp-content/uploads/2026/08/favoritas-on.png',
            off: '/wp-content/uploads/2026/08/favoritas-off.png'
        },
        'libre': {
            on: '/wp-content/uploads/2026/08/libres-on.png',
            off: '/wp-content/uploads/2026/08/libres-off.png'
        }
    };

    // ==========================================
    // FUNCIÓN PARA ACTUALIZAR ICONOS
    // ==========================================
    function updateIcons(activeMode) {
        modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            const icon = btn.querySelector('.j-mode-icon');
            if (icon) {
                const isActive = mode === activeMode;
                icon.src = isActive ? iconPaths[mode].on : iconPaths[mode].off;
            }
        });
    }

    // ==========================================
    // FUNCIÓN PARA ACTIVAR UN MODO
    // ==========================================
    function setActiveMode(activeButton) {
        if (!activeButton) return;
        // Si el botón está oculto, no hacer nada
        if (activeButton.style.display === 'none') return;
        
        modeButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
        updateIcons(activeButton.dataset.mode);
        
        // Disparar evento click para que app.js lo procese
        activeButton.dispatchEvent(new Event('click'));
    }

    // ==========================================
    // FUNCIÓN PRINCIPAL: CONTROL DE MODOS
    // ==========================================
    function controlarModos() {
        // 1. VERIFICAR CATEGORÍA "PERSONALIZADAS"
        const categoriaActiva = document.querySelector('.j-category.active');
        const esPersonalizadas = categoriaActiva && 
            categoriaActiva.textContent.trim().toLowerCase() === 'personalizadas';
        
        // 2. VERIFICAR GRID ACTIVO
        const activeGrid = document.querySelector('.j-grid.active');
        const gridType = activeGrid ? activeGrid.dataset.grid : '';
        const esPocitos3 = gridType === 'pocitos3';
        const esPocitos4 = gridType === 'pocitos4';
        
        console.log('🎯 Controlar modos:', { esPersonalizadas, gridType });
        
        // 3. APLICAR REGLAS DE VISIBILIDAD
        modeButtons.forEach(btn => {
            const mode = btn.dataset.mode;
            
            // 🔥 SI ES PERSONALIZADAS: SOLO MOSTRAR "libre"
            if (esPersonalizadas) {
                btn.style.display = (mode === 'libre') ? '' : 'none';
                return;
            }
            
            // 🔥 SI ES POCITOS 3: OCULTAR "dobles" Y "libre"
            if (esPocitos3) {
                if (mode === 'dobles' || mode === 'libre') {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = '';
                }
                return;
            }
            
            // 🔥 SI ES POCITOS 4: OCULTAR SOLO "libre"
            if (esPocitos4) {
                if (mode === 'libre') {
                    btn.style.display = 'none';
                } else {
                    btn.style.display = '';
                }
                return;
            }
            
            // 🔥 OTROS GRIDS: MOSTRAR TODOS
            btn.style.display = '';
        });
        
        // 4. ACTIVAR MODO CORRECTO AUTOMÁTICAMENTE
        const modoActivo = document.querySelector('.j-mode.active');
        const botonesVisibles = document.querySelectorAll('.j-mode:not([style*="display: none"])');
        
        // Si el modo activo está oculto, buscar uno visible
        if (modoActivo && modoActivo.style.display === 'none') {
            modoActivo.classList.remove('active');
            if (botonesVisibles.length > 0) {
                setActiveMode(botonesVisibles[0]);
            }
        } else if (!modoActivo && botonesVisibles.length > 0) {
            // Si no hay modo activo pero hay visibles, activar el primero
            setActiveMode(botonesVisibles[0]);
        }
        
        // 5. SI ES PERSONALIZADAS, FORZAR "libre" Y MOSTRAR UPLOAD
        if (esPersonalizadas) {
            const libreMode = document.querySelector('.j-mode[data-mode="libre"]');
            if (libreMode && libreMode.style.display !== 'none') {
                setActiveMode(libreMode);
                
                // Mostrar upload de libre
                const libreUpload = document.getElementById('j-libre-upload');
                if (libreUpload) libreUpload.style.display = 'block';
                
                // Ocultar otros options
                document.querySelectorAll('.j-casilla-option').forEach(opt => {
                    if (opt.id !== 'j-libre-upload') {
                        opt.style.display = 'none';
                    }
                });
            }
        } else {
            // Si NO es Personalizadas, asegurar que Sencilla esté visible
            const modoSencilla = document.querySelector('.j-mode[data-mode="sencilla"]');
            if (modoSencilla && modoSencilla.style.display !== 'none') {
                // Solo cambiar si no hay otro activo o el activo es "libre"
                const activo = document.querySelector('.j-mode.active');
                if (!activo || activo.dataset.mode === 'libre') {
                    setActiveMode(modoSencilla);
                }
            }
            
            // Ocultar upload de libre si está visible
            const libreUpload = document.getElementById('j-libre-upload');
            if (libreUpload) libreUpload.style.display = 'none';
        }
    }

    // ==========================================
    // EVENTOS
    // ==========================================
    
    // Click en modos (manual)
    modeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Si está oculto, no hacer nada
            if (this.style.display === 'none') return;
            setActiveMode(this);
        });
    });

    // Click en grids
    gridButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            setTimeout(controlarModos, 100);
        });
    });

    // Observar cambios en categorías (para Personalizadas)
    const categoriesContainer = document.getElementById('juguemos-categories');
    if (categoriesContainer) {
        const observer = new MutationObserver(function() {
            setTimeout(controlarModos, 150);
        });
        observer.observe(categoriesContainer, { childList: true, subtree: true });
    }

    // También observar cuando se selecciona una categoría manualmente
    document.addEventListener('click', function(e) {
        if (e.target.closest('.j-category')) {
            setTimeout(controlarModos, 200);
        }
    });

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================
    
    // Ejecutar al cargar
    setTimeout(controlarModos, 300);
    
    // Ejecutar después de que las categorías se carguen
    setTimeout(controlarModos, 800);
    setTimeout(controlarModos, 1500);

    // Exponer funciones globalmente
    window.controlarModos = controlarModos;
    window.updateIcons = updateIcons;
    window.setActiveMode = setActiveMode;

    console.log('✅ Control de modos unificado inicializado');
});
</script>
