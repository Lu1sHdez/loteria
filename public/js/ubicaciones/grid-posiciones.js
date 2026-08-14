/**
 * =====================================================
 * GRID POSICIONES - Módulo universal de posicionamiento
 * =====================================================
 */

(function() {
    'use strict';

    class GridPosiciones {
        
        static getGridConfig(grid) {
            const configs = {
                '4x4': { cols: 4, rows: 4, total: 16 },
                '5x5': { cols: 5, rows: 5, total: 25 },
                'pocitos4': { cols: 2, rows: 2, total: 4 },
                'pocitos3': { cols: 2, rows: 2, total: 3 },
                'cruzadas': { cols: 4, rows: 4, total: 8 }
            };
            return configs[grid] || configs['4x4'];
        }

        static getPositions(ubicacion, grid, cantidad = 2) {
            const config = this.getGridConfig(grid);
            const { cols, rows, total } = config;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            let posiciones = [];
            
            switch(ubicacion) {
                case 'aleatoria':
                    posiciones = this.getAleatorio(total, cantidad);
                    break;
                case 'centro':
                    posiciones = this.getCentro(cols, rows, cantidad);
                    break;
                case 'esquinas':
                    posiciones = this.getEsquinas(cols, rows, cantidad);
                    break;
                case 'contra-esquina-der-izq':
                    posiciones = this.getContraEsquinaDerIzq(cols, rows, cantidad);
                    break;
                case 'contra-esquina-izq-der':
                    posiciones = this.getContraEsquinaIzqDer(cols, rows, cantidad);
                    break;
                case 'centro-diagonal-der-izq':
                    posiciones = this.getCentroDiagonalDerIzq(cols, rows, cantidad);
                    break;
                case 'centro-diagonal-izq-der':
                    posiciones = this.getCentroDiagonalIzqDer(cols, rows, cantidad);
                    break;
                case 'centro-horizontal':
                    posiciones = this.getCentroHorizontal(cols, rows, cantidad);
                    break;
                case 'centro-vertical':
                    posiciones = this.getCentroVertical(cols, rows, cantidad);
                    break;
                default:
                    posiciones = this.getAleatorio(total, cantidad);
            }
            
            return [...new Set(posiciones)].slice(0, cantidad);
        }

        static getAleatorio(total, cantidad) {
            const indices = Array.from({ length: total }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            return indices.slice(0, cantidad);
        }

        static getCentro(cols, rows, cantidad) {
            const centroCol = (cols - 1) / 2;
            const centroRow = (rows - 1) / 2;
            
            const todas = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    const dist = Math.sqrt(Math.pow(r - centroRow, 2) + Math.pow(c - centroCol, 2));
                    todas.push({ idx, dist });
                }
            }
            
            todas.sort((a, b) => a.dist - b.dist);
            return todas.slice(0, cantidad).map(item => item.idx);
        }

        static getEsquinas(cols, rows, cantidad) {
            const total = cols * rows;
            const posiciones = [];
            const usadas = new Set();
            
            const esquinas = [
                0,
                cols - 1,
                (rows - 1) * cols,
                (rows - 1) * cols + cols - 1
            ];
            
            for (const pos of esquinas) {
                if (posiciones.length >= cantidad) break;
                if (!usadas.has(pos) && pos < total) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                const vecinos = [];
                for (const pos of esquinas) {
                    if (pos >= total) continue;
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    const offsets = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
                    for (const [dr, dc] of offsets) {
                        const nr = row + dr, nc = col + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            const idx = nr * cols + nc;
                            if (!usadas.has(idx)) vecinos.push(idx);
                        }
                    }
                }
                for (const v of vecinos) {
                    if (posiciones.length >= cantidad) break;
                    if (!usadas.has(v)) {
                        posiciones.push(v);
                        usadas.add(v);
                    }
                }
            }
            
            return posiciones;
        }

        static getContraEsquinaDerIzq(cols, rows, cantidad) {
            const total = cols * rows;
            const posiciones = [];
            const usadas = new Set();
            
            const base = [
                0,
                (rows - 1) * cols + cols - 1
            ];
            
            for (const pos of base) {
                if (posiciones.length >= cantidad) break;
                if (!usadas.has(pos) && pos < total) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                const vecinos = [];
                for (const pos of base) {
                    if (pos >= total) continue;
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    const offsets = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
                    for (const [dr, dc] of offsets) {
                        const nr = row + dr, nc = col + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            const idx = nr * cols + nc;
                            if (!usadas.has(idx)) vecinos.push(idx);
                        }
                    }
                }
                for (const v of vecinos) {
                    if (posiciones.length >= cantidad) break;
                    if (!usadas.has(v)) {
                        posiciones.push(v);
                        usadas.add(v);
                    }
                }
            }
            
            return posiciones;
        }

        static getContraEsquinaIzqDer(cols, rows, cantidad) {
            const total = cols * rows;
            const posiciones = [];
            const usadas = new Set();
            
            const base = [
                cols - 1,
                (rows - 1) * cols
            ];
            
            for (const pos of base) {
                if (posiciones.length >= cantidad) break;
                if (!usadas.has(pos) && pos < total) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                const vecinos = [];
                for (const pos of base) {
                    if (pos >= total) continue;
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    const offsets = [[0,1], [1,0], [0,-1], [-1,0], [1,1], [1,-1], [-1,1], [-1,-1]];
                    for (const [dr, dc] of offsets) {
                        const nr = row + dr, nc = col + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            const idx = nr * cols + nc;
                            if (!usadas.has(idx)) vecinos.push(idx);
                        }
                    }
                }
                for (const v of vecinos) {
                    if (posiciones.length >= cantidad) break;
                    if (!usadas.has(v)) {
                        posiciones.push(v);
                        usadas.add(v);
                    }
                }
            }
            
            return posiciones;
        }

        static getCentroDiagonalDerIzq(cols, rows, cantidad) {
            const total = cols * rows;
            const diagonal = [];
            
            for (let i = 0; i < Math.min(cols, rows); i++) {
                const idx = i * cols + (cols - 1 - i);
                if (idx < total) diagonal.push(idx);
            }
            
            return this.ordenarPorCentro(diagonal, cols, rows).slice(0, cantidad);
        }

        static getCentroDiagonalIzqDer(cols, rows, cantidad) {
            const total = cols * rows;
            const diagonal = [];
            
            for (let i = 0; i < Math.min(cols, rows); i++) {
                const idx = i * cols + i;
                if (idx < total) diagonal.push(idx);
            }
            
            return this.ordenarPorCentro(diagonal, cols, rows).slice(0, cantidad);
        }

        static getCentroHorizontal(cols, rows, cantidad) {
            const centroRow = Math.floor(rows / 2);
            const fila = [];
            
            for (let c = 0; c < cols; c++) {
                const idx = centroRow * cols + c;
                if (idx < cols * rows) fila.push(idx);
            }
            
            const centroCol = Math.floor(cols / 2);
            fila.sort((a, b) => Math.abs((a % cols) - centroCol) - Math.abs((b % cols) - centroCol));
            
            return fila.slice(0, cantidad);
        }

        static getCentroVertical(cols, rows, cantidad) {
            const centroCol = Math.floor(cols / 2);
            const columna = [];
            
            for (let r = 0; r < rows; r++) {
                const idx = r * cols + centroCol;
                if (idx < cols * rows) columna.push(idx);
            }
            
            const centroRow = Math.floor(rows / 2);
            columna.sort((a, b) => Math.abs(Math.floor(a / cols) - centroRow) - Math.abs(Math.floor(b / cols) - centroRow));
            
            return columna.slice(0, cantidad);
        }

        static ordenarPorCentro(posiciones, cols, rows) {
            const centroRow = (rows - 1) / 2;
            const centroCol = (cols - 1) / 2;
            
            return posiciones.sort((a, b) => {
                const ra = Math.floor(a / cols), ca = a % cols;
                const rb = Math.floor(b / cols), cb = b % cols;
                const distA = Math.sqrt(Math.pow(ra - centroRow, 2) + Math.pow(ca - centroCol, 2));
                const distB = Math.sqrt(Math.pow(rb - centroRow, 2) + Math.pow(cb - centroCol, 2));
                return distA - distB;
            });
        }

        static getTotalCasillas(grid) {
            return this.getGridConfig(grid).total;
        }

        static getColumnas(grid) {
            return this.getGridConfig(grid).cols;
        }

        static getFilas(grid) {
            return this.getGridConfig(grid).rows;
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    window.GridPosiciones = GridPosiciones;

    console.log('📦 GridPosiciones.js cargado correctamente');

})();
