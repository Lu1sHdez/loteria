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
        const barajas = JuguemosState.barajas || [];
        if (barajas.length === 0) return [];
    
        const sheets = [];
        const totalBarajas = barajas.length;
    
        const sheetWidth = paper.width * scale;
        const sheetHeight = paper.height * scale;
        const isHorizontal = sheetWidth > sheetHeight;
    
        const margin = 5; // Margen en píxeles
        const gap = 2; // Espacio entre cartas
        const maxCardsPerSheet = 10;
    
        const availableWidth = sheetWidth - (margin * 2);
        const availableHeight = sheetHeight - (margin * 2);
    
        // 🔥 DETERMINAR DISTRIBUCIÓN ÓPTIMA
        // Probar diferentes configuraciones y elegir la que mejor se adapte
        let bestConfig = null;
        let bestCoverage = 0;
    
        // Posibles configuraciones (columnas x filas)
        const configs = [
            { cols: 2, rows: 5 }, // 10 cartas
            { cols: 5, rows: 2 }, // 10 cartas
            { cols: 3, rows: 3 }, // 9 cartas
            { cols: 3, rows: 4 }, // 12 cartas
            { cols: 4, rows: 3 }, // 12 cartas
            { cols: 3, rows: 5 }, // 15 cartas
            { cols: 5, rows: 3 }, // 15 cartas
            { cols: 2, rows: 6 }, // 12 cartas
            { cols: 6, rows: 2 }, // 12 cartas
            { cols: 4, rows: 4 }, // 16 cartas
            { cols: 2, rows: 7 }, // 14 cartas
            { cols: 7, rows: 2 }, // 14 cartas
        ];
    
        const cardAspectRatio = 2 / 3; // Ancho/Alto de una carta
    
        for (const config of configs) {
            const { cols, rows } = config;
            const cardsPerSheet = cols * rows;
            
            // Si necesitamos menos cartas que las que caben, saltar
            if (cardsPerSheet > maxCardsPerSheet) continue;
            // Si caben muy pocas, saltar
            if (cardsPerSheet < Math.min(totalBarajas, 4)) continue;
    
            // Calcular tamaño de carta para esta configuración
            let cardWidth = (availableWidth - ((cols - 1) * gap)) / cols;
            let cardHeight = cardWidth / cardAspectRatio;
    
            // Verificar si cabe en altura
            const neededHeight = (rows * cardHeight) + ((rows - 1) * gap);
            
            if (neededHeight > availableHeight) {
                // Ajustar por altura
                cardHeight = (availableHeight - ((rows - 1) * gap)) / rows;
                cardWidth = cardHeight * cardAspectRatio;
                
                // Verificar si cabe en ancho
                const neededWidth = (cols * cardWidth) + ((cols - 1) * gap);
                if (neededWidth > availableWidth) {
                    // No cabe ni ajustando, pasar a siguiente configuración
                    continue;
                }
            }
    
            // Calcular cobertura (qué tan bien usa el espacio)
            const actualWidth = (cols * cardWidth) + ((cols - 1) * gap);
            const actualHeight = (rows * cardHeight) + ((rows - 1) * gap);
            const coverage = (actualWidth * actualHeight) / (availableWidth * availableHeight);
    
            // Si es mejor cobertura o es la primera configuración válida
            if (!bestConfig || coverage > bestCoverage) {
                bestConfig = {
                    cols,
                    rows,
                    cardWidth: Math.floor(cardWidth),
                    cardHeight: Math.floor(cardHeight),
                    cardsPerSheet,
                    coverage
                };
                bestCoverage = coverage;
            }
        }
    
        // Si no encontramos configuración, usar una por defecto
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
    
        // Recalcular dimensiones finales con los valores redondeados
        const { cols, rows, cardWidth, cardHeight, cardsPerSheet } = bestConfig;
    
        const gridWidth = (cols * cardWidth) + ((cols - 1) * gap);
        const gridHeight = (rows * cardHeight) + ((rows - 1) * gap);
    
        const offsetX = Math.round((sheetWidth - gridWidth) / 2);
        const offsetY = Math.round((sheetHeight - gridHeight) / 2);
    
        const sheetsNeeded = Math.ceil(totalBarajas / cardsPerSheet);
    
        console.log(`📐 Hoja: ${sheetWidth}x${sheetHeight}px`);
        console.log(`🃏 Distribución: ${cols}x${rows} = ${cardsPerSheet} barajas`);
        console.log(`🃏 Tamaño carta: ${cardWidth}x${cardHeight}px`);
        console.log(`📊 Ocupación: ${(bestConfig.coverage * 100).toFixed(1)}%`);
    
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
                    cols,
                    rows,
                    cardWidth,
                    cardHeight,
                    gap,
                    offsetX,
                    offsetY,
                    gridWidth,
                    gridHeight,
                    totalCards: endIndex - startIndex
                });
            }
    
            sheets.push(sheet);
        }
    
        console.log(`${sheets.length} hoja(s) de barajas extras generadas`);
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
        
        // Solo mostrar marcas si hay más de una carta
        if (totalCards > 1) {
            // Contorno exterior - solo si hay más de una carta
            const contorno = document.createElement('div');
            Object.assign(contorno.style, {
                position: 'absolute',
                top: (offsetY - gap / 2) + 'px',
                left: (offsetX - gap / 2) + 'px',
                width: (gridWidth + gap) + 'px',
                height: (gridHeight + gap) + 'px',
                border: '2px dashed #999', // 🔥 Más sutil
                borderRadius: '4px',
                pointerEvents: 'none',
                opacity: '0.4', // 🔥 Más transparente
                boxSizing: 'border-box'
            });
            marks.appendChild(contorno);
            
            // Líneas verticales entre columnas (solo si hay más de 1 columna)
            if (cols > 1) {
                for (let col = 1; col < cols; col++) {
                    const x = offsetX + (cardWidth * col) + (gap * (col - 0.5));
                    this.createCutLine(marks, 'vertical', x, offsetY, gridHeight);
                }
            }
            
            // Líneas horizontales entre filas (solo si hay más de 1 fila)
            if (rows > 1) {
                for (let row = 1; row < rows; row++) {
                    const y = offsetY + (cardHeight * row) + (gap * (row - 0.5));
                    this.createCutLine(marks, 'horizontal', y, offsetX, gridWidth);
                }
            }
        }
        
        sheet.appendChild(marks);
    },

    /**
     * Renderizar vista previa completa
     */
    // En print-preview.js - REEMPLAZAR el método render() existente

    render() {
        const container = document.getElementById('j-print-preview');
        if (!container) {
            return;
        }
    
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
        
        if (paper.orientation === 'vertical') {
            scale = Math.min(scaleX, scale * 1.1);
        }
    
        // Guardar layout para usar en barajas
        this.currentPaper = paper;
        this.currentScale = scale;
    
        console.log(`📏 Escala calculada: ${scale.toFixed(2)}x (${paper.width}mm x ${paper.height}mm)`);
    
        // 🔥 1. Generar páginas de tablas de juego
        for (let page = 0; page < totalPages; page++) {
            const sheet = this.createSheet(paper, scale, page);
            container.appendChild(sheet);
        }
    
        // 🔥 2. Generar páginas de barajas sueltas (SOLO si está activado)
        if (incluirBarajas) {
            const barajaSheets = this.generateBarajaSheets(paper, scale);
            
            // 🔥 SOLO AÑADIR SEPARADOR SI HAY BARAJAS
            if (barajaSheets.length > 0) {
                // Añadir un separador visual entre tablas y barajas
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
                
                // Añadir las hojas de barajas
                barajaSheets.forEach(sheet => {
                    container.appendChild(sheet);
                });
            }
            
            console.log(`🃏 ${barajaSheets.length} hoja(s) de barajas añadidas`);
        }
    
        console.log(`PrintPaper: ${totalPages} página(s) de juego + ${incluirBarajas ? 'barajas' : 'sin barajas'} renderizada(s)`);
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
    const isCruzadas = gridType === 'cruzadas';

    // Configuración base del board
    Object.assign(board.style, {
        border: `2px solid ${JuguemosState.marcoColor || '#FA299C'}`,
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

    // Obtener casillas para esta tabla
    const todasLasTablas = JuguemosState.todasLasTablas || [];
    const casillasAsignadas = JuguemosState.casillasAsignadas || [];
    
    const indexGlobal = (pageIndex * (JuguemosState.quantity || 1)) + boardIndex;
    
    let casillasParaEstaTabla;
    if (todasLasTablas[indexGlobal]) {
        casillasParaEstaTabla = todasLasTablas[indexGlobal];
    } else if (todasLasTablas.length > 0) {
        const baseTabla = todasLasTablas[boardIndex % todasLasTablas.length] || casillasAsignadas;
        casillasParaEstaTabla = [...baseTabla];
    } else {
        casillasParaEstaTabla = casillasAsignadas;
    }

    // 🔥 OBTENER FAVORITAS PARA RESALTAR
    const favoritas = JuguemosState.favoritas || [];
    const tieneFavoritas = favoritas.length > 0 && JuguemosState.mode === 'favoritas';

    // 🔥 OBTENER CARTAS DOBLES PARA RESALTAR
    const cartasDobles = JuguemosState.cartasDobles || [];
    const numerosDobles = cartasDobles.map(c => parseInt(c.numero));
    const esModoDobles = JuguemosState.mode === 'dobles';

    // ==========================================
    // CASO ESPECIAL: POCITOS 3
    // ==========================================
    if (isPocitos3) {
        // Configuración especial para Pocitos 3
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

        // Obtener las 3 casillas en el orden correcto
        const casillas = [
            casillasParaEstaTabla[0] || null,
            casillasParaEstaTabla[1] || null,
            casillasParaEstaTabla[2] || null
        ];

        // Posiciones especiales para Pocitos 3
        const posicionesGrid = [
            { row: '1 / 3', col: '1' },      // Casilla 0: izquierda (ocupa 2 filas)
            { row: '1', col: '2' },           // Casilla 1: arriba derecha
            { row: '2', col: '2' }            // Casilla 2: abajo derecha
        ];


        for (let i = 0; i < 3; i++) {
            const cell = document.createElement('div');
            cell.className = 'j-board-cell';
            cell.dataset.index = i;
            
            // Posicionamiento especial
            const pos = posicionesGrid[i];
            if (pos) {
                cell.style.gridRow = pos.row;
                cell.style.gridColumn = pos.col;
            }
            
            // Estilo de celda
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
                
                // MODO LIBRE
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
                    objectFit: isPocitos3 ? 'fill' : 'contain',
                    padding: isPocitos3 ? '0px' : '2px',
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
                
                // BADGE DE FAVORITA
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
                // Celda vacía
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

    // ==========================================
    // GRIDS NORMALES (4x4, 5x5, pocitos4, cruzadas)
    // ==========================================
    const { cols, rows, total } = config;
    
    // Configurar grid CSS
    let gapValue = '2px';
    if (isPocitos4) gapValue = '0px';
    
    let gridCols = cols;
    let gridRows = rows;
    
    if (isPocitos4) {
        gridCols = 2;
        gridRows = 2;
    }
    
    Object.assign(grid.style, {
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
        gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        gap: gapValue,
        width: '100%',
        height: '100%',
        padding: isPocitos4 ? '0px' : '2px',
        boxSizing: 'border-box'
    });
    // Generar celdas
    for (let i = 0; i < total; i++) {
        const cell = document.createElement('div');
        cell.className = 'j-board-cell';
        cell.dataset.index = i;
        
        // 🔥 POSICIONAMIENTO ESPECIAL PARA CRUZADAS
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
        
        // Estilo de celda
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

        // Obtener casilla
        const casilla = casillasParaEstaTabla && casillasParaEstaTabla[i] ? casillasParaEstaTabla[i] : null;
        
        // Verificar si es favorita
        const esFavorita = tieneFavoritas && casilla && favoritas.some(f => f && f.numero === casilla.numero);
        
        // 🔥 Verificar si es doble
        const esDoble = esModoDobles && casilla && numerosDobles.includes(parseInt(casilla.numero));

        if (casilla) {
            const img = document.createElement('img');
            
            // 🔥 MODO LIBRE: Usar imágenes subidas por el usuario
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
            
            // 🔥 BADGE DE FAVORITA
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
