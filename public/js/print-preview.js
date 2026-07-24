/**
 * =====================================================
 * PRINT PAPER ENGINE - Vista previa de impresión
 * =====================================================
 */

window.PrintPaper = {

    // Configuración de grids
    gridConfig: {
        '4x4': { cols: 4, rows: 4, total: 16 },
        '5x5': { cols: 5, rows: 5, total: 25 },
        'pocitos4': { cols: 2, rows: 2, total: 4 },
        'pocitos3': { cols: 3, rows: 3, total: 3 },
        'cruzadas': { cols: 3, rows: 3, total: 5 }
    },

    // Tamaños de papel en mm
    paperSizes: {
        'carta': { width: 215.9, height: 279.4, label: 'Carta' },
        'oficio': { width: 215.9, height: 330.2, label: 'Oficio' },
        'a4': { width: 210, height: 297, label: 'A4' },
        'letter': { width: 215.9, height: 279.4, label: 'Letter' },
        'legal': { width: 215.9, height: 355.6, label: 'Legal' }
    },

    /**
     * Obtener configuración actual del papel
     */
    getPaperConfig() {
        const paper = JuguemosState.paper || 'carta';
        const orientation = JuguemosState.orientation || 'vertical';
        const size = this.paperSizes[paper] || this.paperSizes['carta'];

        return {
            type: paper,
            label: size.label,
            country: JuguemosState.country || 'Mexico',
            width: orientation === 'horizontal' ? size.height : size.width,
            height: orientation === 'horizontal' ? size.width : size.height,
            orientation: orientation,
            rawWidth: size.width,
            rawHeight: size.height
        };
    },

    /**
 * Renderizar vista previa completa
 */
render() {
    const container = document.getElementById('j-print-preview');
    if (!container) {
        console.warn('⚠️ PrintPaper: No se encontró #j-print-preview');
        return;
    }

    console.log('🔄 PrintPaper: Renderizando...');
    console.log('📐 Configuración:', JuguemosState);

    container.innerHTML = '';

    const paper = this.getPaperConfig();
    const totalPages = Number(JuguemosState.pages) || 1;

    // NUEVO: Calcular escala para que quepa en pantalla pero sea más grande
    const maxWidth = Math.min(container.clientWidth - 20, 2000); // Aumentado de 800 a 1200
    const maxHeight = window.innerHeight - 150;
    
    // NUEVO: Escala base sin limitación superior
    let scaleX = maxWidth / paper.width;
    let scaleY = maxHeight / paper.height;
    let scale = Math.min(scaleX, scaleY);
    
    // NUEVO: Establecer escala mínima y máxima
    const minScale = 0.5; // Mínimo 50%
    const maxScale = 2.5; // Máximo 250%
    scale = Math.max(minScale, Math.min(scale, maxScale));
    
    // NUEVO: Si es vertical, dar prioridad al ancho
    if (paper.orientation === 'vertical') {
        // Usar el ancho disponible sin limitar tanto
        scale = Math.min(scaleX, scale * 1.1);
    }

    console.log(`📏 Escala calculada: ${scale.toFixed(2)}x (${paper.width}mm x ${paper.height}mm)`);

    // Crear cada página
    for (let page = 0; page < totalPages; page++) {
        const sheet = this.createSheet(paper, scale, page);
        container.appendChild(sheet);
    }

    console.log(`PrintPaper: ${totalPages} página(s) renderizada(s)`);
},

    /**
     * Crear una hoja
     */
    createSheet(paper, scale, pageIndex) {
        const sheet = document.createElement('div');
        sheet.className = 'j-sheet';
        sheet.dataset.page = pageIndex + 1;

        // Aplicar tamaño escalado
        const width = paper.width * scale;
        const height = paper.height * scale;
        sheet.style.width = width + 'px';
        sheet.style.height = height + 'px';

        // Orientación
        sheet.dataset.orientation = paper.orientation;

        // Contenido de la hoja
        const content = document.createElement('div');
        content.className = 'j-sheet-content';

        // Tablas por hoja
        const totalBoards = Number(JuguemosState.quantity) || 1;
        const grid = JuguemosState.grid || '4x4';
        const config = this.gridConfig[grid] || this.gridConfig['4x4'];

        // Calcular tamaño de cada tabla
        const margin = 15;
        const availableWidth = (paper.width * scale) - (margin * 2);
        const availableHeight = (paper.height * scale) - (margin * 2);

        let cols, rows;
        if (totalBoards <= 2) {
            cols = totalBoards;
            rows = 1;
        } else if (totalBoards <= 4) {
            cols = 2;
            rows = Math.ceil(totalBoards / 2);
        } else if (totalBoards <= 6) {
            cols = 3;
            rows = Math.ceil(totalBoards / 3);
        } else {
            cols = Math.ceil(Math.sqrt(totalBoards));
            rows = Math.ceil(totalBoards / cols);
        }

        const boardWidth = (availableWidth - (cols - 1) * 10) / cols;
        const boardHeight = (availableHeight - (rows - 1) * 10) / rows;

        // Crear grid de tablas
        const boardContainer = document.createElement('div');
        boardContainer.className = 'j-boards-grid';
        boardContainer.style.display = 'grid';
        boardContainer.style.gridTemplateColumns = `repeat(${cols}, ${boardWidth}px)`;
        boardContainer.style.gridTemplateRows = `repeat(${rows}, ${boardHeight}px)`;
        boardContainer.style.gap = '10px';
        boardContainer.style.width = '100%';
        boardContainer.style.height = '100%';
        boardContainer.style.justifyContent = 'center';
        boardContainer.style.alignContent = 'center';

        for (let i = 0; i < totalBoards; i++) {
            const board = this.createBoard(config, i, pageIndex);
            board.style.width = boardWidth + 'px';
            board.style.height = boardHeight + 'px';
            boardContainer.appendChild(board);
        }

        content.appendChild(boardContainer);
        sheet.appendChild(content);

        // Marcas de corte
        if (JuguemosState.cutMarks) {
            this.addCutMarks(sheet, paper, scale);
        }

        return sheet;
    },

    /**
     * Crear una tabla (board) con su grid de casillas
     */
    createBoard(config, boardIndex, pageIndex) {
        const board = document.createElement('div');
        board.className = 'j-print-board';
        board.dataset.board = boardIndex + 1;
        board.dataset.page = pageIndex + 1;

        board.style.border = `2px solid ${JuguemosState.marcoColor || '#FA299C'}`;
        board.style.borderRadius = '4px';
        board.style.overflow = 'hidden';
        board.style.backgroundColor = JuguemosState.fondoColor || '#FFFFFF';
        board.style.display = 'flex';
        board.style.alignItems = 'center';
        board.style.justifyContent = 'center';
        board.style.padding = '4px';

        const grid = document.createElement('div');
        grid.className = 'j-board-grid';
        grid.dataset.grid = JuguemosState.grid || '4x4';

        const { cols, rows, total } = config;

        grid.style.display = 'grid';
        const gridType = JuguemosState.grid || '4x4';
        if (gridType === 'pocitos4' || gridType === 'pocitos3' || gridType === 'cruzadas') {
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.gridTemplateRows = 'repeat(3, 1fr)';
        } else {
            grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        }
        grid.style.gap = '2px';
        grid.style.width = '100%';
        grid.style.height = '100%';
        grid.style.padding = '2px';
        grid.style.boxSizing = 'border-box';

        const todasLasTablas = JuguemosState.todasLasTablas || [];
        const casillasAsignadas = JuguemosState.casillasAsignadas || [];

        let casillasParaEstaTabla;
        const indexGlobal = (pageIndex * (JuguemosState.quantity || 1)) + boardIndex;

        // Si existe la tabla en el índice global, usarla
        if (todasLasTablas[indexGlobal]) {
            casillasParaEstaTabla = todasLasTablas[indexGlobal];
            console.log(`Tabla ${indexGlobal + 1}: usando orden único de todasLasTablas`);
        } 
        // Si no existe pero hay tablas generadas, usar la primera y mezclarla
        else if (todasLasTablas.length > 0) {
            // Usar la primera tabla como base y mezclarla
            const baseTabla = todasLasTablas[0] || casillasAsignadas;
            casillasParaEstaTabla = [...baseTabla];

            const mezcla = [...(JuguemosState.barajas || [])];
            // Mezclar para que sea diferente
            for (let i = casillasParaEstaTabla.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
                [casillasParaEstaTabla[i], casillasParaEstaTabla[j]] = [casillasParaEstaTabla[j], casillasParaEstaTabla[i]];
            }
            console.log(`Tabla ${indexGlobal + 1}: usando mezcla de tabla base`);
        } 
        // Fallback: usar casillasAsignadas
        else {
            casillasParaEstaTabla = casillasAsignadas;
            console.log(`Tabla ${indexGlobal + 1}: usando casillasAsignadas (fallback)`);
        }

        const mostrarBarajas = JuguemosState.barajasIncluidas !== false;

        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'j-board-cell';
            cell.dataset.index = i;

            cell.style.border = `1px solid ${JuguemosState.marcoColor || '#FA299C'}`;
            cell.style.borderRadius = '2px';
            cell.style.backgroundColor = JuguemosState.fondoColor || '#FFFFFF';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.overflow = 'hidden';
            cell.style.position = 'relative';

            const casilla = casillasParaEstaTabla[i];

            if (casilla && mostrarBarajas) {
                const img = document.createElement('img');
                img.src = casilla.imagen;
                img.alt = casilla.nombre;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                img.style.padding = '2px';
                img.style.boxSizing = 'border-box';

                img.onerror = function () {
                    this.style.display = 'none';
                    cell.textContent = casilla.nombre || '❌';
                    cell.style.fontSize = '8px';
                    cell.style.textAlign = 'center';
                    cell.style.color = '#333';
                };

                cell.appendChild(img);

            } else {
                cell.textContent = i + 1;
                cell.style.fontSize = '10px';
                cell.style.color = '#ccc';
                cell.style.fontWeight = 'bold';
            }

            grid.appendChild(cell);
        }

        board.appendChild(grid);
        return board;
    },

    /**
     * Agregar marcas de corte
     */
    addCutMarks(sheet, paper, scale) {
        const marks = document.createElement('div');
        marks.className = 'j-cut-marks';
        marks.style.position = 'absolute';
        marks.style.top = '0';
        marks.style.left = '0';
        marks.style.width = '100%';
        marks.style.height = '100%';
        marks.style.pointerEvents = 'none';
        marks.style.zIndex = '10';

        // Líneas de corte (esquinas)
        const markSize = 10 * scale;
        const positions = [
            { top: 0, left: 0, right: 'auto', bottom: 'auto' },
            { top: 0, left: 'auto', right: 0, bottom: 'auto' },
            { top: 'auto', left: 0, right: 'auto', bottom: 0 },
            { top: 'auto', left: 'auto', right: 0, bottom: 0 }
        ];

        positions.forEach(pos => {
            const mark = document.createElement('div');
            mark.style.position = 'absolute';
            mark.style.top = pos.top;
            mark.style.left = pos.left;
            mark.style.right = pos.right;
            mark.style.bottom = pos.bottom;
            mark.style.width = markSize + 'px';
            mark.style.height = markSize + 'px';
            mark.style.border = '1px solid #333';
            mark.style.borderRadius = '0';
            mark.style.boxSizing = 'border-box';

            if (pos.top === 0 && pos.left === 0) {
                mark.style.borderRight = 'none';
                mark.style.borderBottom = 'none';
            } else if (pos.top === 0 && pos.right === 0) {
                mark.style.borderLeft = 'none';
                mark.style.borderBottom = 'none';
            } else if (pos.bottom === 0 && pos.left === 0) {
                mark.style.borderRight = 'none';
                mark.style.borderTop = 'none';
            } else if (pos.bottom === 0 && pos.right === 0) {
                mark.style.borderLeft = 'none';
                mark.style.borderTop = 'none';
            }

            marks.appendChild(mark);
        });

        sheet.appendChild(marks);
        sheet.style.position = 'relative';
    },

    /**
     * Refrescar vista previa
     */
    refresh() {
        // Esperar a que el DOM esté listo
        setTimeout(() => {
            this.render();
        }, 50);
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('PrintPaper: Inicializando...');
        PrintPaper.render();
    });
} else {
    console.log('PrintPaper: Inicializando (DOM ya cargado)...');
    PrintPaper.render();
}

// Exponer función global
window.refreshPrintPreview = function() {
    if (typeof PrintPaper !== 'undefined') {
        PrintPaper.refresh();
        console.log('PrintPaper: Refresh forzado');
    }
};


// En cambio de papel
paperSelect.addEventListener("change", function () {
    JuguemosState.paper = this.value;
    updateOrderSummary();
    if (typeof PrintPaper !== 'undefined') {
        setTimeout(() => PrintPaper.refresh(), 100);
    }
});

// En cambio de país
document.querySelectorAll(".country").forEach(button => {
    button.addEventListener("click", () => {
        // ... código existente ...
        if (typeof PrintPaper !== 'undefined') {
            setTimeout(() => PrintPaper.refresh(), 150);
        }
    });
});

// En cambio de orientación
document.querySelectorAll(".j-orientation").forEach(button => {
    button.addEventListener("click", () => {
        // ... código existente ...
        if (typeof PrintPaper !== 'undefined') {
            setTimeout(() => PrintPaper.refresh(), 100);
        }
    });
});

// En cambio de grid
document.querySelectorAll(".j-grid").forEach(button => {
    button.addEventListener("click", () => {
        // ... código existente ...
        if (typeof PrintPaper !== 'undefined') {
            setTimeout(() => PrintPaper.refresh(), 100);
        }
    });
});

// En cambio de cantidad
tablesPerPageInput.addEventListener("input", () => {
    JuguemosState.quantity = parseInt(tablesPerPageInput.value) || 1;
    updateOrderSummary();
    if (typeof PrintPaper !== 'undefined') {
        setTimeout(() => PrintPaper.refresh(), 100);
    }
});

// En cambio de páginas
pagesInput.addEventListener("input", () => {
    // ... código existente ...
    if (typeof PrintPaper !== 'undefined') {
        setTimeout(() => PrintPaper.refresh(), 100);
    }
});

// En cambio de colores
document.querySelectorAll(".j-color-swatch, .j-fondo-card").forEach(el => {
    el.addEventListener("click", () => {
        // ... código existente ...
        if (typeof PrintPaper !== 'undefined') {
            setTimeout(() => PrintPaper.refresh(), 100);
        }
    });
});

// En selección aleatoria
btnAleatoria.addEventListener("click", function() {
    // ... código existente ...
    if (typeof PrintPaper !== 'undefined') {
        setTimeout(() => PrintPaper.refresh(), 150);
    }
});

// En toggle de barajas
btnIncluir.addEventListener("click", function() {
    // ... código existente ...
    if (typeof PrintPaper !== 'undefined') {
        setTimeout(() => PrintPaper.refresh(), 100);
    }
});

// En botón Siguiente
btnGoPreview.addEventListener("click", () => {
    // ... código existente ...
    setTimeout(() => {
        if (typeof PrintPaper !== 'undefined') {
            PrintPaper.refresh();
        }
    }, 200);
});

/**
 * REFRESH CON INDICADOR DE CARGA
 */
PrintPaper.refresh = function() {
    // Mostrar estado de carga
    if (window.updatePreviewState) {
        window.updatePreviewState('loading');
    }
    
    // Esperar y renderizar
    setTimeout(() => {
        this.render();
        
        // Ocultar carga
        if (window.updatePreviewState) {
            window.updatePreviewState('ready');
        }
        
        // Actualizar timestamp
        if (window.updateTimestamp) {
            window.updateTimestamp();
        }
        
        console.log('🔄 PrintPaper: Vista previa actualizada');
    }, 100);
};

/**
 * REFRESH CON ANIMACIÓN
 */
PrintPaper.refreshWithAnimation = function() {
    const container = document.getElementById('j-print-preview');
    if (container) {
        // Animación de fade
        container.style.opacity = '0.5';
        container.style.transition = 'opacity 0.2s ease';
        
        this.refresh();
        
        setTimeout(() => {
            container.style.opacity = '1';
        }, 200);
    } else {
        this.refresh();
    }
};