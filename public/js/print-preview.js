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
        'a4': { width: 210, height: 297, label: 'Tabloide' },
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
            // 🔥 Si es horizontal, intercambiar ancho y alto
            width: orientation === 'horizontal' ? size.height : size.width,
            height: orientation === 'horizontal' ? size.width : size.height,
            orientation: orientation,
            rawWidth: size.width,
            rawHeight: size.height
        };
    },
    getPaperLabel() {
        const paper = JuguemosState.paper || 'carta';
        const size = this.paperSizes[paper] || this.paperSizes['carta'];
        return size.label;
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
        
        // 🔥 OBTENER ORIENTACIÓN
        const orientation = paper.orientation || 'vertical';
        const isHorizontal = orientation === 'horizontal';
        
        // 🔥 DISTRIBUCIÓN INTELIGENTE SEGÚN ORIENTACIÓN Y CANTIDAD
        if (isHorizontal) {
            // HORIZONTAL: Optimizar para que quepan más tablas por fila
            if (totalBoards <= 2) {
                cols = totalBoards;
                rows = 1;
            } else if (totalBoards <= 4) {
                cols = Math.min(totalBoards, 4);
                rows = Math.ceil(totalBoards / cols);
            } else if (totalBoards <= 6) {
                cols = 3;
                rows = Math.ceil(totalBoards / cols);
            } else if (totalBoards <= 8) {
                cols = 4;
                rows = Math.ceil(totalBoards / cols);
            } else if (totalBoards <= 10) {
                cols = 5;
                rows = Math.ceil(totalBoards / cols);
            } else if (totalBoards <= 12) {
                cols = 6;
                rows = Math.ceil(totalBoards / cols);
            } else {
                // Para más de 12, calcular automáticamente
                cols = Math.min(Math.ceil(Math.sqrt(totalBoards * 1.5)), 6);
                rows = Math.ceil(totalBoards / cols);
            }
        } else {
            // VERTICAL: Comportamiento original
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
        }
    
        const boardRatio = JuguemosState.grid === 'pocitos3' ? 4 / 3 : 2 / 3;
        
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

    generateBarajaSheets(paper, scale) {
        // 🔥 Obtener barajas según el modo
        let barajas = [];
        
        if (JuguemosState.mode === 'libre' && JuguemosState.libreImages && JuguemosState.libreImages.length > 0) {
            // Modo libre: usar imágenes personalizadas
            barajas = JuguemosState.libreImages.map((img, index) => {
                return {
                    numero: index + 1,
                    nombre: `Personalizada ${index + 1}`,
                    imagen: img.data || img
                };
            });
        } else {
            // Modo normal: usar barajas del diseño
            barajas = JuguemosState.barajas || [];
        }
        
        if (barajas.length === 0) return [];
    
        const sheets = [];
        const totalBarajas = barajas.length;
    
        const sheetWidth = paper.width * scale;
        const sheetHeight = paper.height * scale;
        const isHorizontal = sheetWidth > sheetHeight;
    
        const margin = 5;
        const gap = 2;
        const maxCardsPerSheet = 10;
    
        const availableWidth = sheetWidth - (margin * 2);
        const availableHeight = sheetHeight - (margin * 2);
    
        let bestConfig = null;
        let bestCoverage = 0;
    
        const configs = [
            { cols: 2, rows: 5 }, { cols: 5, rows: 2 },
            { cols: 3, rows: 3 }, { cols: 3, rows: 4 },
            { cols: 4, rows: 3 }, { cols: 3, rows: 5 },
            { cols: 5, rows: 3 }, { cols: 2, rows: 6 },
            { cols: 6, rows: 2 }, { cols: 4, rows: 4 },
            { cols: 2, rows: 7 }, { cols: 7, rows: 2 }
        ];
    
        const cardAspectRatio = 2 / 3; 
    
        for (const config of configs) {
            const { cols, rows } = config;
            const cardsPerSheet = cols * rows;
            
            if (cardsPerSheet > maxCardsPerSheet) continue;
            if (cardsPerSheet < Math.min(totalBarajas, 4)) continue;
    
            let cardWidth = (availableWidth - ((cols - 1) * gap)) / cols;
            let cardHeight = cardWidth / cardAspectRatio;
    
            const neededHeight = (rows * cardHeight) + ((rows - 1) * gap);
            
            if (neededHeight > availableHeight) {
                cardHeight = (availableHeight - ((rows - 1) * gap)) / rows;
                cardWidth = cardHeight * cardAspectRatio;
                
                const neededWidth = (cols * cardWidth) + ((cols - 1) * gap);
                if (neededWidth > availableWidth) {
                    continue;
                }
            }
    
            const actualWidth = (cols * cardWidth) + ((cols - 1) * gap);
            const actualHeight = (rows * cardHeight) + ((rows - 1) * gap);
            const coverage = (actualWidth * actualHeight) / (availableWidth * availableHeight);
    
            if (!bestConfig || coverage > bestCoverage) {
                bestConfig = {
                    cols, rows,
                    cardWidth: Math.floor(cardWidth),
                    cardHeight: Math.floor(cardHeight),
                    cardsPerSheet,
                    coverage
                };
                bestCoverage = coverage;
            }
        }
    
        if (!bestConfig) {
            bestConfig = {
                cols: isHorizontal ? 3 : 2,
                rows: isHorizontal ? 2 : 3,
                cardWidth: Math.floor((availableWidth - (3 * gap)) / (isHorizontal ? 4 : 3)),
                cardHeight: 0,
                cardsPerSheet: 0,
                coverage: 0
            };
            bestConfig.cardHeight = Math.floor(bestConfig.cardWidth / cardAspectRatio);
            bestConfig.cardsPerSheet = bestConfig.cols * bestConfig.rows;
        }
    
        const { cols, rows, cardWidth, cardHeight, cardsPerSheet } = bestConfig;
    
        const gridWidth = (cols * cardWidth) + ((cols - 1) * gap);
        const gridHeight = (rows * cardHeight) + ((rows - 1) * gap);
    
        const offsetX = Math.round((sheetWidth - gridWidth) / 2);
        const offsetY = Math.round((sheetHeight - gridHeight) / 2);
    
        const sheetsNeeded = Math.ceil(totalBarajas / cardsPerSheet);
    
        for (let sheetIndex = 0; sheetIndex < sheetsNeeded; sheetIndex++) {
            const sheet = document.createElement('div');
            sheet.className = 'j-sheet j-sheet-barajas';
            sheet.dataset.page = `Barajas ${sheetIndex + 1}`;
    
            Object.assign(sheet.style, {
                position: 'relative',
                width: sheetWidth + 'px',
                height: sheetHeight + 'px',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                boxSizing: 'border-box',
                margin: '0 auto 20px auto'
            });
    
            const cardsContainer = document.createElement('div');
            cardsContainer.className = 'j-barajas-grid';
    
            Object.assign(cardsContainer.style, {
                display: 'grid',
                gridTemplateColumns: `repeat(${cols}, ${cardWidth}px)`,
                gridTemplateRows: `repeat(${rows}, ${cardHeight}px)`,
                gap: gap + 'px',
                position: 'absolute',
                left: offsetX + 'px',
                top: offsetY + 'px',
                width: gridWidth + 'px',
                height: gridHeight + 'px',
                padding: '0',
                margin: '0',
                boxSizing: 'border-box'
            });
    
            const startIndex = sheetIndex * cardsPerSheet;
            const endIndex = Math.min(startIndex + cardsPerSheet, totalBarajas);
    
            for (let i = startIndex; i < endIndex; i++) {
                const baraja = barajas[i];
                if (!baraja) continue;
    
                const card = document.createElement('div');
                card.className = 'j-baraja-card';
    
                Object.assign(card.style, {
                    width: '100%',
                    height: '100%',
                    padding: '0',
                    margin: '0',
                    boxSizing: 'border-box',
                    border: '1.5px solid #d0d0d0',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    position: 'relative'
                });
    
                const img = document.createElement('img');
                img.src = baraja.imagen;
                img.alt = baraja.nombre || `Baraja ${baraja.numero}`;
    
                Object.assign(img.style, {
                    position: 'absolute',
                    left: '0',
                    top: '0',
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    boxSizing: 'border-box',
                    objectFit: 'contain',
                    objectPosition: 'center center'
                });
    
                img.onerror = function() {
                    this.style.display = 'none';
                    const fallback = document.createElement('span');
                    fallback.textContent = baraja.nombre || '❌';
                    Object.assign(fallback.style, {
                        fontSize: '12px',
                        textAlign: 'center',
                        padding: '4px',
                        color: '#666',
                        fontFamily: 'Cairo, sans-serif'
                    });
                    card.appendChild(fallback);
                };
    
                card.appendChild(img);
                cardsContainer.appendChild(card);
            }
    
            sheet.appendChild(cardsContainer);
    
            if (JuguemosState.cutMarks) {
                this.addCutMarksToBarajas(sheet, paper, scale, {
                    cols, rows, cardWidth, cardHeight, gap,
                    offsetX, offsetY, gridWidth, gridHeight,
                    totalCards: endIndex - startIndex
                });
            }
    
            sheets.push(sheet);
        }
    
        return sheets;
    },
    
    addCutMarksToBarajas(sheet, paper, scale, layout) {
        const marks = document.createElement('div');
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
        
        const { cols, rows, cardWidth, cardHeight, gap, offsetX, offsetY, gridWidth, gridHeight, totalCards } = layout;
        
        if (totalCards > 1) {
            const contorno = document.createElement('div');
            Object.assign(contorno.style, {
                position: 'absolute',
                top: (offsetY - gap / 2) + 'px',
                left: (offsetX - gap / 2) + 'px',
                width: (gridWidth + gap) + 'px',
                height: (gridHeight + gap) + 'px',
                border: '2px dashed #999',
                borderRadius: '4px',
                pointerEvents: 'none',
                opacity: '0.4',
                boxSizing: 'border-box'
            });
            marks.appendChild(contorno);
            
            if (cols > 1) {
                for (let col = 1; col < cols; col++) {
                    const x = offsetX + (cardWidth * col) + (gap * (col - 0.5));
                    this.createCutLine(marks, 'vertical', x, offsetY, gridHeight);
                }
            }
            
            if (rows > 1) {
                for (let row = 1; row < rows; row++) {
                    const y = offsetY + (cardHeight * row) + (gap * (row - 0.5));
                    this.createCutLine(marks, 'horizontal', y, offsetX, gridWidth);
                }
            }
        }
        
        sheet.appendChild(marks);
    },

    render() {
        const container = document.getElementById('j-print-preview');
        if (!container) return;
    
        container.innerHTML = '';
    
        const paper = this.getPaperConfig();
        const totalPages = Number(JuguemosState.pages) || 1;
        const incluirBarajas = JuguemosState.barajasIncluidas !== false;
    
        const maxWidth = Math.min(container.clientWidth - 20, 2000);
        const maxHeight = window.innerHeight - 150;
        
        let scaleX = maxWidth / paper.width;
        let scaleY = maxHeight / paper.height;
        let scale = Math.min(scaleX, scaleY);
        
        const minScale = 0.5;
        const maxScale = 2.5;
        scale = Math.max(minScale, Math.min(scale, maxScale));
        
        // 🔥 Si es horizontal, ajustar escala para que quepa mejor
        if (paper.orientation === 'horizontal') {
            // Permitir un poco más de escala horizontal
            scale = Math.min(scaleX * 0.95, scaleY * 0.9);
            scale = Math.max(minScale, Math.min(scale, maxScale));
        }
        
        if (paper.orientation === 'vertical') {
            scale = Math.min(scaleX, scale * 1.1);
        }
    
        this.currentPaper = paper;
        this.currentScale = scale;
    
        for (let page = 0; page < totalPages; page++) {
            const sheet = this.createSheet(paper, scale, page);
            container.appendChild(sheet);
        }
    
        if (incluirBarajas) {
            const barajaSheets = this.generateBarajaSheets(paper, scale);
            if (barajaSheets.length > 0) {
                const separator = document.createElement('div');
                separator.style.cssText = `
                    width: 100%;
                    text-align: center;
                    padding: 30px 0 20px 0;
                    border-top: 3px solid #e0e0e0;
                    margin: 30px 0 20px 0;
                    color: #666;
                    font-family: 'Cairo', sans-serif;
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 2px;
                `;
                separator.textContent = 'BARAJAS INCLUIDAS';
                container.appendChild(separator);
                barajaSheets.forEach(sheet => container.appendChild(sheet));
            }
        }
    },
    createSheet(paper, scale, pageIndex) {
        const sheet = document.createElement('div');
        sheet.className = 'j-sheet';
        sheet.dataset.page = pageIndex + 1;
        sheet.style.position = 'relative';
    
        const layout = this.getBoardLayout(paper, scale);
    
        sheet.style.width = layout.sheetWidth + 'px';
        sheet.style.height = layout.sheetHeight + 'px';
        sheet.dataset.orientation = paper.orientation;
    
        // 🔥 Si es horizontal, asegurar que el grid se expanda correctamente
        if (paper.orientation === 'horizontal') {
            sheet.style.maxWidth = '100%';
            sheet.style.overflow = 'hidden';
        }
    
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
        
        // 🔥 Ajustar grid para horizontal
        const gridTemplate = `repeat(${layout.cols}, ${layout.boardWidth}px)`;
        const gridTemplateRows = `repeat(${layout.rows}, ${layout.boardHeight}px)`;
        
        Object.assign(boardContainer.style, {
            display: 'grid',
            gridTemplateColumns: gridTemplate,
            gridTemplateRows: gridTemplateRows,
            gap: layout.gap + 'px',
            position: 'absolute',
            left: layout.offsetX + 'px',
            top: layout.offsetY + 'px',
            width: layout.gridWidth + 'px',
            height: layout.gridHeight + 'px',
            justifyContent: 'center',
            alignItems: 'center'
        });
    
        // 🔥 Si es horizontal y hay muchas tablas, ajustar el grid
        if (paper.orientation === 'horizontal' && layout.totalBoards > 6) {
            boardContainer.style.justifyContent = 'center';
            boardContainer.style.alignItems = 'center';
        }
    
        for (let i = 0; i < layout.totalBoards; i++) {
            const board = this.createBoard(
                this.gridConfig[JuguemosState.grid || '4x4'] || this.gridConfig['4x4'],
                i,
                pageIndex,
                layout.cols
            );
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

    createBoard(config, boardIndex, pageIndex, cols) {
        const totalBoardsPorPagina = JuguemosState.quantity || 1;
        const totalTablas = totalBoardsPorPagina * (JuguemosState.pages || 1);
    
        const board = document.createElement('div');
        board.className = 'j-print-board';
        board.dataset.board = boardIndex + 1;
        board.dataset.page = pageIndex + 1;
    
        const gridType = JuguemosState.grid || '4x4';
        const isPocitos3 = gridType === 'pocitos3';
        const isPocitos4 = gridType === 'pocitos4';
        const isCruzadas = gridType === 'cruzadas';
    
        Object.assign(board.style, {
            border: `2px solid #D9D9D9`,            
            borderRadius: '4px',
            overflow: 'hidden',
            backgroundColor: JuguemosState.fondoColor || '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isPocitos3 ? '4px' : '4px',
            boxSizing: 'border-box',
            aspectRatio: isPocitos3 ? '4/3' : '2/3'    
        });
    
        const grid = document.createElement('div');
        grid.className = 'j-board-grid';
        grid.dataset.grid = gridType;
    
        const todasLasTablas = JuguemosState.todasLasTablas || [];
        const casillasAsignadas = JuguemosState.casillasAsignadas || [];
        
        const indexGlobal = (pageIndex * totalBoardsPorPagina) + boardIndex;
        
        let casillasParaEstaTabla;
        if (todasLasTablas[indexGlobal]) {
            casillasParaEstaTabla = todasLasTablas[indexGlobal];
        } else if (todasLasTablas.length > 0) {
            const baseTabla = todasLasTablas[boardIndex % todasLasTablas.length] || casillasAsignadas;
            casillasParaEstaTabla = [...baseTabla];
        } else {
            casillasParaEstaTabla = casillasAsignadas;
        }
    
        const favoritas = JuguemosState.favoritas || [];
        const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';
    
        const cartasDobles = JuguemosState.cartasDobles || [];
        const numerosDobles = cartasDobles.map(c => parseInt(c.numero));
        const esModoDobles = JuguemosState.mode === 'dobles';
    
        if (isPocitos3) {
            Object.assign(grid.style, {
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '0px',
                width: '100%',
                height: '100%',
                padding: '0px',
                boxSizing: 'border-box'
            });
    
            const casillas = [
                casillasParaEstaTabla[0] || null,
                casillasParaEstaTabla[1] || null,
                casillasParaEstaTabla[2] || null
            ];
    
            const posicionesGrid = [
                { row: '1 / 3', col: '1' },
                { row: '1', col: '2' },
                { row: '2', col: '2' }
            ];
    
            // 🔥 Calcular columnas reales
            let columnas = 0;
            if (typeof cols === 'number' && cols > 0) {
                columnas = cols;
            } else {
                const n = totalBoardsPorPagina;
                if (n > 2 && n <= 4) columnas = 2;
                else if (n > 4 && n <= 6) columnas = 3;
                else if (n > 6) columnas = Math.ceil(Math.sqrt(n));
            }
    
            // 🔥 Calcular fila actual y si hay tabla debajo
            const indexActual = (pageIndex * totalBoardsPorPagina) + boardIndex;
    
            for (let i = 0; i < 3; i++) {
                const cell = document.createElement('div');
                cell.className = 'j-board-cell';
                cell.dataset.index = i;
                
                const pos = posicionesGrid[i];
                if (pos) {
                    cell.style.gridRow = pos.row;
                    cell.style.gridColumn = pos.col;
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
                    aspectRatio: 'auto'
                });
    
                const casilla = casillas[i];
                const esFavorita = tieneFavoritas && casilla && favoritas.some(f => f && f.numero === casilla.numero);
                const esDoble = esModoDobles && casilla && numerosDobles.includes(parseInt(casilla.numero));
    
                if (casilla) {
                    const img = document.createElement('img');
                    let imagenSrc = casilla.imagen;
                    
                    // 🔥 Lógica para i === 0 (izquierda) - imagen completa
                    if (i === 0) {
                        Object.assign(img.style, {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center center',
                            display: 'block',
                            boxSizing: 'border-box'
                        });
                    } 
                    // 🔥 Lógica para i === 1 (superior derecha) - SIEMPRE MITAD INFERIOR
                    else if (i === 1) {
                        Object.assign(img.style, {
                            position: 'absolute',
                            top: '-100%',
                            left: '0',
                            width: '100%',
                            height: '200%',
                            objectFit: 'cover',
                            objectPosition: 'bottom center',
                            display: 'block',
                            boxSizing: 'border-box'
                        });
                    } 
                    // 🔥 Lógica para i === 2 (inferior derecha) - SIEMPRE MITAD SUPERIOR
                    else if (i === 2) {
                        // Usar la imagen de la baraja 2 de la tabla de ABAJO
                        if (columnas > 0) {
                            const indexDebajo = indexActual + columnas;
                            if (indexDebajo < totalTablas && todasLasTablas[indexDebajo]) {
                                const tablaDebajo = todasLasTablas[indexDebajo];
                                if (tablaDebajo && tablaDebajo[1]) {
                                    imagenSrc = tablaDebajo[1].imagen;
                                }
                            }
                        }
                        
                        // SIEMPRE MITAD SUPERIOR
                        Object.assign(img.style, {
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            width: '100%',
                            height: '200%',
                            objectFit: 'cover',
                            objectPosition: 'top center',
                            display: 'block',
                            boxSizing: 'border-box'
                        });
                    }
                    
                    // Asignar src después de que imagenSrc esté definida
                    if (JuguemosState.mode === 'libre' && JuguemosState.libreImages && JuguemosState.libreImages.length > 0) {
                        const libreIndex = casilla.numero ? casilla.numero - 1 : i;
                        if (JuguemosState.libreImages[libreIndex]) {
                            img.src = JuguemosState.libreImages[libreIndex].data;
                            img.alt = casilla.nombre || `Libre ${libreIndex + 1}`;
                        } else {
                            img.src = imagenSrc;
                            img.alt = casilla.nombre;
                        }
                    } else {
                        img.src = imagenSrc;
                        img.alt = casilla.nombre || 'Baraja';
                    }
                    
                    img.onerror = function() {
                        this.style.display = 'none';
                        cell.textContent = casilla.nombre || '❌';
                        cell.style.fontSize = '8px';
                        cell.style.textAlign = 'center';
                        cell.style.color = '#333';
                    };
                    
                    cell.appendChild(img);
                    
                    if (esFavorita) {
                        const badge = document.createElement('span');
                        badge.textContent = '⭐';
                        Object.assign(badge.style, {
                            position: 'absolute',
                            top: '1px',
                            right: '1px',
                            fontSize: '8px',
                            lineHeight: '1',
                            zIndex: '5',
                            textShadow: '0 0 3px rgba(255,255,255,0.8)'
                        });
                        cell.appendChild(badge);
                    }
                } else {
                    cell.textContent = '';
                    Object.assign(cell.style, {
                        backgroundColor: 'transparent',
                        border: 'none',
                        boxShadow: 'none'
                    });
                }
    
                grid.appendChild(cell);
            }
    
            board.appendChild(grid);
            return board;
        }
    
        const { cols: gridCols, rows: gridRows, total } = config;
        
        let gapValue = '2px';
        if (isPocitos4) gapValue = '0px';
        
        let finalCols = gridCols;
        let finalRows = gridRows;
        
        if (isPocitos4) {
            gridCols = 2;
            gridRows = 2;
        }
        
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: `repeat(${finalCols}, 1fr)`,
            gridTemplateRows: `repeat(${finalRows}, 1fr)`,
            gap: gapValue,
            width: '100%',
            height: '100%',
            padding: isPocitos4 ? '0px' : '2px',
            boxSizing: 'border-box'
        });
    
        for (let i = 0; i < total; i++) {
            const cell = document.createElement('div');
            cell.className = 'j-board-cell';
            cell.dataset.index = i;
            
            if (isCruzadas) {
                const positions = {
                    0: { row: 1, col: 1 },
                    1: { row: 2, col: 2 },
                    2: { row: 3, col: 3 },
                    3: { row: 4, col: 4 },
                    4: { row: 1, col: 4 },
                    5: { row: 2, col: 3 },
                    6: { row: 3, col: 2 },
                    7: { row: 4, col: 1 }
                };
                const pos = positions[i];
                if (pos) {
                    cell.style.gridRow = pos.row;
                    cell.style.gridColumn = pos.col;
                }
            }
            
            Object.assign(cell.style, {
                border: `1px solid ${JuguemosState.marcoColor || '#FA299C'}`,
                borderRadius: '2px',
                backgroundColor: JuguemosState.marcoColor || '#FA299C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: '2/3'
            });
    
            const casilla = casillasParaEstaTabla && casillasParaEstaTabla[i] ? casillasParaEstaTabla[i] : null;
            
            const esFavorita = tieneFavoritas && casilla && favoritas.some(f => f && f.numero === casilla.numero);
            const esDoble = esModoDobles && casilla && numerosDobles.includes(parseInt(casilla.numero));
    
            if (casilla) {
                const img = document.createElement('img');
                
                if (JuguemosState.mode === 'libre' && JuguemosState.libreImages && JuguemosState.libreImages.length > 0) {
                    const libreIndex = casilla.numero ? casilla.numero - 1 : i;
                    if (JuguemosState.libreImages[libreIndex]) {
                        img.src = JuguemosState.libreImages[libreIndex].data;
                        img.alt = casilla.nombre || `Libre ${libreIndex + 1}`;
                    } else {
                        img.src = casilla.imagen;
                        img.alt = casilla.nombre;
                    }
                } else {
                    img.src = casilla.imagen;
                    img.alt = casilla.nombre || 'Baraja';
                }
                
                Object.assign(img.style, {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
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
                
                if (esFavorita) {
                    const badge = document.createElement('span');
                    badge.textContent = '⭐';
                    Object.assign(badge.style, {
                        position: 'absolute',
                        top: '1px',
                        right: '1px',
                        fontSize: '8px',
                        lineHeight: '1',
                        zIndex: '5',
                        textShadow: '0 0 3px rgba(255,255,255,0.8)'
                    });
                    cell.appendChild(badge);
                }
            } else {
                if (isPocitos4) {
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

    refresh() {
        setTimeout(() => {
            this.render();
        }, 50);
    }
};
