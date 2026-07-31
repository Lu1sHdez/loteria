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
        'pocitos3': { cols: 2, rows: 2, total: 3 },
        'cruzadas': { cols: 4, rows: 4, total: 8 }
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
    getBoardLayout(paper, scale) {
        const totalBoards = Number(JuguemosState.quantity) || 1;
        const margin = 15;
        const gap = 8;

        const sheetWidth = paper.width * scale;
        const sheetHeight = paper.height * scale;

        const availableWidth = sheetWidth - (margin * 2);
        const availableHeight = sheetHeight - (margin * 2);

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

        const boardRatio = 2 / 3;
        let boardWidth = (availableWidth - (cols - 1) * gap) / cols;
        let boardHeight = (availableHeight - (rows - 1) * gap) / rows;

        const maxWidthByHeight = boardHeight * boardRatio;
        if (boardWidth > maxWidthByHeight) {
            boardWidth = maxWidthByHeight;
            boardHeight = boardWidth / boardRatio;
        } else {
            const maxHeightByWidth = boardWidth / boardRatio;
            if (boardHeight > maxHeightByWidth) {
                boardHeight = maxHeightByWidth;
                boardWidth = boardHeight * boardRatio;
            }
        }

        boardWidth = Math.round(boardWidth);
        boardHeight = Math.round(boardHeight);

        const gridWidth = cols * boardWidth + (cols - 1) * gap;
        const gridHeight = rows * boardHeight + (rows - 1) * gap;

        const offsetX = Math.round(margin + (availableWidth - gridWidth) / 2);
        const offsetY = Math.round(margin + (availableHeight - gridHeight) / 2);

        return {
            totalBoards, cols, rows,
            boardWidth, boardHeight,
            gap, margin,
            sheetWidth, sheetHeight,
            gridWidth, gridHeight,
            offsetX, offsetY
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

        const maxWidth = Math.min(container.clientWidth - 20, 2000);
        const maxHeight = window.innerHeight - 150;
        
        let scaleX = maxWidth / paper.width;
        let scaleY = maxHeight / paper.height;
        let scale = Math.min(scaleX, scaleY);
        
        const minScale = 0.5;
        const maxScale = 2.5;
        scale = Math.max(minScale, Math.min(scale, maxScale));
        
        if (paper.orientation === 'vertical') {
            scale = Math.min(scaleX, scale * 1.1);
        }

        console.log(`📏 Escala calculada: ${scale.toFixed(2)}x (${paper.width}mm x ${paper.height}mm)`);

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
        sheet.style.position = 'relative';

        const layout = this.getBoardLayout(paper, scale);

        sheet.style.width = layout.sheetWidth + 'px';
        sheet.style.height = layout.sheetHeight + 'px';
        sheet.dataset.orientation = paper.orientation;

        const content = document.createElement('div');
        content.className = 'j-sheet-content';
        Object.assign(content.style, {
            position: 'relative',
            width: '100%',
            height: '100%',
            padding: '0',
            display: 'block',
            boxSizing: 'border-box'
        });

        const boardContainer = document.createElement('div');
        boardContainer.className = 'j-boards-grid';
        Object.assign(boardContainer.style, {
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.cols}, ${layout.boardWidth}px)`,
            gridTemplateRows: `repeat(${layout.rows}, ${layout.boardHeight}px)`,
            gap: layout.gap + 'px',
            position: 'absolute',
            left: layout.offsetX + 'px',
            top: layout.offsetY + 'px',
            width: layout.gridWidth + 'px',
            height: layout.gridHeight + 'px'
        });

        for (let i = 0; i < layout.totalBoards; i++) {
            const board = this.createBoard(this.gridConfig[JuguemosState.grid || '4x4'] || this.gridConfig['4x4'], i, pageIndex);
            board.style.width = layout.boardWidth + 'px';
            board.style.height = layout.boardHeight + 'px';
            board.style.flexShrink = '0';
            boardContainer.appendChild(board);
        }

        content.appendChild(boardContainer);
        sheet.appendChild(content);

        if (JuguemosState.cutMarks) {
            this.addCutMarks(sheet, paper, scale, layout);
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
    
        const gridType = JuguemosState.grid || '4x4';
        const isPocitos3 = gridType === 'pocitos3';
        const isPocitos4 = gridType === 'pocitos4';
    
        // 🔥 Si es Pocitos 3, usar lógica especial con conexión de mitades
        if (isPocitos3) {
            Object.assign(board.style, {
                border: `2px solid ${JuguemosState.marcoColor || '#FA299C'}`,
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: JuguemosState.fondoColor || '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                boxSizing: 'border-box',
                aspectRatio: '1 / 1'
            });
    
            const grid = document.createElement('div');
            grid.className = 'j-board-grid';
            grid.dataset.grid = 'pocitos3';
    
            // 🔥 GRID: 2 columnas (1fr 0.5fr)
            Object.assign(grid.style, {
                display: 'grid',
                gridTemplateColumns: '1fr 0.5fr',
                gridTemplateRows: '1fr 1fr',
                gap: '1px',
                width: '100%',
                height: '100%',
                padding: '1px',
                boxSizing: 'border-box'
            });
    
            const todasLasTablas = JuguemosState.todasLasTablas || [];
            const casillasAsignadas = JuguemosState.casillasAsignadas || [];
    
            let casillasParaEstaTabla;
            const indexGlobal = (pageIndex * (JuguemosState.quantity || 1)) + boardIndex;
    
            if (todasLasTablas[indexGlobal]) {
                casillasParaEstaTabla = todasLasTablas[indexGlobal];
            } else if (todasLasTablas.length > 0) {
                const baseTabla = todasLasTablas[0] || casillasAsignadas;
                casillasParaEstaTabla = [...baseTabla];
                for (let i = casillasParaEstaTabla.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [casillasParaEstaTabla[i], casillasParaEstaTabla[j]] = [casillasParaEstaTabla[j], casillasParaEstaTabla[i]];
                }
            } else {
                casillasParaEstaTabla = casillasAsignadas;
            }
    
            // 🔥 CONEXIÓN: Casilla 3 se conecta con casilla 2 de la siguiente tabla
            const totalTablas = todasLasTablas.length;
            let casilla1, casilla2, casilla3;
    
            casilla1 = casillasParaEstaTabla[0] || null;
    
            if (boardIndex > 0 && totalTablas > 1) {
                const tablaAnterior = todasLasTablas[indexGlobal - 1];
                if (tablaAnterior && tablaAnterior[2]) {
                    casilla2 = tablaAnterior[2];
                } else {
                    casilla2 = casillasParaEstaTabla[1] || null;
                }
            } else {
                casilla2 = casillasParaEstaTabla[1] || null;
            }
    
            if (boardIndex < totalTablas - 1 && totalTablas > 1) {
                const tablaSiguiente = todasLasTablas[indexGlobal + 1];
                if (tablaSiguiente && tablaSiguiente[1]) {
                    casilla3 = tablaSiguiente[1];
                } else {
                    casilla3 = casillasParaEstaTabla[2] || null;
                }
            } else {
                casilla3 = casillasParaEstaTabla[2] || null;
            }
    
            const casillas = [casilla1, casilla2, casilla3];
            const mostrarBarajas = JuguemosState.barajasIncluidas !== false;
    
            for (let i = 0; i < 3; i++) {
                const cell = document.createElement('div');
                cell.className = 'j-board-cell';
                cell.dataset.index = i;
    
                // 🔥 POSICIONAMIENTO
                if (i === 0) {
                    // Casilla 1: ocupa toda la izquierda
                    cell.style.gridRow = '1 / 3';
                    cell.style.gridColumn = '1';
                    cell.style.aspectRatio = 'auto';
                } else {
                    // Casilla 2 y 3: cuadradas
                    cell.style.aspectRatio = '1 / 1';
                    if (i === 1) {
                        cell.style.gridRow = '1';
                        cell.style.gridColumn = '2';
                    } else if (i === 2) {
                        cell.style.gridRow = '2';
                        cell.style.gridColumn = '2';
                    }
                }
    
                // 🔥 BORDES
                const borderColor = JuguemosState.marcoColor || '#FA299C';
                if (i === 0) {
                    cell.style.borderRight = `2px solid ${borderColor}`;
                    cell.style.borderTop = 'none';
                    cell.style.borderBottom = 'none';
                    cell.style.borderLeft = 'none';
                } else if (i === 1) {
                    cell.style.borderBottom = `2px solid ${borderColor}`;
                    cell.style.borderTop = 'none';
                    cell.style.borderLeft = 'none';
                    cell.style.borderRight = 'none';
                } else {
                    cell.style.border = 'none';
                }
    
                Object.assign(cell.style, {
                    borderRadius: '2px',
                    backgroundColor: JuguemosState.fondoColor || '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                });
    
                const casilla = casillas[i];
    
                if (casilla && mostrarBarajas) {
                    const img = document.createElement('img');
                    img.src = casilla.imagen;
                    img.alt = casilla.nombre || 'Baraja';
                    Object.assign(img.style, {
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        padding: '2px',
                        boxSizing: 'border-box'
                    });
    
                    img.onerror = function() {
                        this.style.display = 'none';
                        cell.textContent = casilla.nombre || '❌';
                        cell.style.fontSize = '8px';
                        cell.style.textAlign = 'center';
                        cell.style.color = '#333';
                    };
    
                    cell.appendChild(img);
                } else {
                    cell.textContent = i + 1;
                    Object.assign(cell.style, {
                        fontSize: '10px',
                        color: '#ccc',
                        fontWeight: 'bold'
                    });
                }
    
                grid.appendChild(cell);
            }
    
            board.appendChild(grid);
            return board;
        }
    
        // 🔥 Para los demás grids (4x4, 5x5, pocitos4, cruzadas)
        Object.assign(board.style, {
            border: `2px solid ${JuguemosState.marcoColor || '#FA299C'}`,
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: JuguemosState.fondoColor || '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px',
            boxSizing: 'border-box',
            aspectRatio: '2/3'
        });
    
        const grid = document.createElement('div');
        grid.className = 'j-board-grid';
        grid.dataset.grid = JuguemosState.grid || '4x4';
    
        const { cols, rows, total } = config;
    
        const isSpecial = [].includes(gridType);
    
        let gapValue = '2px';
        if (isPocitos4) {
            gapValue = '0px';
        }
    
        let gridCols = cols;
        let gridRows = rows;
    
        if (isPocitos4) {
            gridCols = 2;
            gridRows = 2;
        }
    
        let gridTemplateCols = isSpecial ? 'repeat(3, 1fr)' : `repeat(${gridCols}, 1fr)`;
        let gridTemplateRows = isSpecial ? 'repeat(3, 1fr)' : `repeat(${gridRows}, 1fr)`;
    
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: gridTemplateCols,
            gridTemplateRows: gridTemplateRows,
            gap: gapValue,
            width: '100%',
            height: '100%',
            padding: isPocitos4 ? '0px' : '2px',
            boxSizing: 'border-box'
        });
    
        const todasLasTablas = JuguemosState.todasLasTablas || [];
        const casillasAsignadas = JuguemosState.casillasAsignadas || [];
    
        let casillasParaEstaTabla;
        const indexGlobal = (pageIndex * (JuguemosState.quantity || 1)) + boardIndex;
    
        if (todasLasTablas[indexGlobal]) {
            casillasParaEstaTabla = todasLasTablas[indexGlobal];
        } else if (todasLasTablas.length > 0) {
            const baseTabla = todasLasTablas[0] || casillasAsignadas;
            casillasParaEstaTabla = [...baseTabla];
            for (let i = casillasParaEstaTabla.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [casillasParaEstaTabla[i], casillasParaEstaTabla[j]] = [casillasParaEstaTabla[j], casillasParaEstaTabla[i]];
            }
        } else {
            casillasParaEstaTabla = casillasAsignadas;
        }
    
        const mostrarBarajas = JuguemosState.barajasIncluidas !== false;
    
        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'j-board-cell';
            cell.dataset.index = i;
        
            // 🔥 POSICIONAMIENTO ESPECIAL PARA CRUZADAS (4x4)
            if (gridType === 'cruzadas') {
                // Diagonal principal (arriba-izquierda a abajo-derecha)
                if (i === 0) { cell.style.gridRow = '1'; cell.style.gridColumn = '1'; }
                if (i === 1) { cell.style.gridRow = '2'; cell.style.gridColumn = '2'; }
                if (i === 2) { cell.style.gridRow = '3'; cell.style.gridColumn = '3'; }
                if (i === 3) { cell.style.gridRow = '4'; cell.style.gridColumn = '4'; }
                // Diagonal secundaria (arriba-derecha a abajo-izquierda)
                if (i === 4) { cell.style.gridRow = '1'; cell.style.gridColumn = '4'; }
                if (i === 5) { cell.style.gridRow = '2'; cell.style.gridColumn = '3'; }
                if (i === 6) { cell.style.gridRow = '3'; cell.style.gridColumn = '2'; }
                if (i === 7) { cell.style.gridRow = '4'; cell.style.gridColumn = '1'; }
            }
        
            Object.assign(cell.style, {
                border: `1px solid ${JuguemosState.marcoColor || '#FA299C'}`,
                borderRadius: '2px',
                backgroundColor: JuguemosState.fondoColor || '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '2/3'
            });
    
            const casilla = casillasParaEstaTabla[i];
    
            if (casilla && mostrarBarajas) {
                const img = document.createElement('img');
                img.src = casilla.imagen;
                img.alt = casilla.nombre;
                Object.assign(img.style, {
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    padding: '2px',
                    boxSizing: 'border-box'
                });
    
                img.onerror = function() {
                    this.style.display = 'none';
                    cell.textContent = casilla.nombre || '❌';
                    cell.style.fontSize = '8px';
                    cell.style.textAlign = 'center';
                    cell.style.color = '#333';
                };
    
                cell.appendChild(img);
            } else {
                if (gridType === 'pocitos4') {
                    cell.textContent = '';
                    Object.assign(cell.style, {
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none'
                    });
                } else {
                    cell.textContent = i + 1;
                    Object.assign(cell.style, {
                        fontSize: '10px',
                        color: '#ccc',
                        fontWeight: 'bold'
                    });
                }
            }
    
            grid.appendChild(cell);
        }
    
        board.appendChild(grid);
        return board;
    },


    addCutMarks(sheet, paper, scale, layout) {
        layout = layout || this.getBoardLayout(paper, scale);

        const marks = document.createElement('div');
        marks.className = 'j-cut-marks';
        Object.assign(marks.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '10',
            overflow: 'hidden'
        });

        const { cols, rows, boardWidth, boardHeight, gap, offsetX, offsetY, gridWidth, gridHeight, totalBoards } = layout;

        const contorno = document.createElement('div');
        Object.assign(contorno.style, {
            position: 'absolute',
            top: (offsetY - gap / 2) + 'px',
            left: (offsetX - gap / 2) + 'px',
            width: (gridWidth + gap) + 'px',
            height: (gridHeight + gap) + 'px',
            border: '4px dashed #666',
            borderRadius: '4px',
            pointerEvents: 'none',
            opacity: '0.6',
            boxSizing: 'border-box'
        });
        marks.appendChild(contorno);

        const cutLineOffsetX = -1; 
        const cutLineOffsetY = 0;  
        if (totalBoards > 1) {
            for (let col = 1; col < cols; col++) {
                const x = offsetX + (boardWidth * col) + (gap * (col - 0.5)) + cutLineOffsetX;
                this.createCutLine(marks, 'vertical', x, offsetY, gridHeight);
            }

            for (let row = 1; row < rows; row++) {
                const y = offsetY + (boardHeight * row) + (gap * (row - 0.5)) + cutLineOffsetY;
                this.createCutLine(marks, 'horizontal', y, offsetX, gridWidth);
            }
        }

        sheet.appendChild(marks);
        sheet.style.position = 'relative';
    },

    /**
     * Crear una línea discontinua individual
     */
    createCutLine(container, direction, position, start, length) {
        position = Math.round(position);
        start = Math.round(start);
        length = Math.round(length);
    
        const isVertical = direction === 'vertical';
        const thickness = 2;
        const dashLength = 6;
        const gapLength = 8;
        const step = dashLength + gapLength;
    
        const totalDashes = Math.ceil(length / step);
    
        for (let i = 0; i < totalDashes; i++) {
            const dash = document.createElement('div');
            const offset = i * step;
            const currentDashLength = Math.min(dashLength, length - offset);
    
            if (currentDashLength <= 0) break;
    
            Object.assign(dash.style, {
                position: 'absolute',
                backgroundColor: '#666',
                opacity: '0.7',
                pointerEvents: 'none',
                zIndex: '10'
            });
    
            if (isVertical) {
                Object.assign(dash.style, {
                    left: position + 'px',
                    top: (start + offset) + 'px',
                    width: thickness + 'px',
                    height: currentDashLength + 'px'
                });
            } else {
                Object.assign(dash.style, {
                    top: position + 'px',
                    left: (start + offset) + 'px',
                    width: currentDashLength + 'px',
                    height: thickness + 'px'
                });
            }
    
            container.appendChild(dash);
        }
    },

    /**
     * Refrescar vista previa
     */
    refresh() {
        setTimeout(() => {
            this.render();
        }, 50);
    }
};
