/**
 * =====================================================
 * DOBLES - Módulo independiente
 * =====================================================
 */

(function() {
    'use strict';

    class DoblesManager {
        constructor() {
            this.ubicacion = 'aleatoria'; // Solo una ubicación
            this.posicionesDobles = [];
            this.cartasDobles = [];
            this.asignacionDobles = {};
            this.container = document.getElementById('j-dobles-option');
            
            this.init();
        }

        init() {
            if (!this.container) {
                console.warn('⚠️ DoblesManager: Contenedor no encontrado');
                return;
            }

            this.bindEvents();
            this.actualizarEstadoGlobal();
            
            console.log('📋 DoblesManager iniciado');
        }

        /**
         * Vincula los eventos de los radio buttons
         */
        bindEvents() {
            const radios = this.container.querySelectorAll('.j-ubicacion-radio-input');
            
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        this.ubicacion = radio.dataset.ubicacion;
                        JuguemosState.ubicacionDoble = this.ubicacion;
                        
                        this.actualizarPreviewUbicacion();
                        this.actualizarEstadoGlobal();
                        
                        if (typeof llenarCasillasAutomatico === 'function') {
                            setTimeout(() => {
                                llenarCasillasAutomatico();
                            }, 100);
                        }
                    }
                });
            });
        }
        /**
         * Obtiene posiciones según la ubicación seleccionada
         * SIEMPRE RETORNA SOLO 2 POSICIONES
         */
        obtenerPosicionesPorUbicacion(grid, cantidad) {
            // 🔥 Forzar a que siempre sean 2 posiciones
            const total = this.getTotalCasillas(grid);
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            
            // Si el grid tiene menos de 2 casillas, ajustar
            if (total < 2) {
                return [0];
            }
            
            let posiciones = [];
            const usadas = new Set();
            
            // 🔥 Siempre pedir 2 posiciones
            const cantidadReal = Math.min(2, total);
            
            switch(this.ubicacion) {
                case 'aleatoria':
                    posiciones = this.obtenerAleatorio(grid, cantidadReal, usadas);
                    break;
                case 'centro':
                    posiciones = this.obtenerCentro(grid, cantidadReal, usadas);
                    break;
                case 'contra-esquina-der-izq':
                    posiciones = this.obtenerContraEsquinaDerIzq(grid, cantidadReal, usadas);
                    break;
                case 'contra-esquina-izq-der':
                    posiciones = this.obtenerContraEsquinaIzqDer(grid, cantidadReal, usadas);
                    break;
                case 'centro-diagonal-der-izq':
                    posiciones = this.obtenerCentroDiagonalDerIzq(grid, cantidadReal, usadas);
                    break;
                case 'centro-diagonal-izq-der':
                    posiciones = this.obtenerCentroDiagonalIzqDer(grid, cantidadReal, usadas);
                    break;
                case 'centro-horizontal':
                    posiciones = this.obtenerCentroHorizontal(grid, cantidadReal, usadas);
                    break;
                case 'centro-vertical':
                    posiciones = this.obtenerCentroVertical(grid, cantidadReal, usadas);
                    break;
                default:
                    posiciones = this.obtenerAleatorio(grid, cantidadReal, usadas);
            }
            
            // Asegurar que siempre tengamos 2 posiciones
            while (posiciones.length < 2 && posiciones.length < total) {
                for (let i = 0; i < total; i++) {
                    if (!posiciones.includes(i)) {
                        posiciones.push(i);
                        break;
                    }
                }
            }
            
            return posiciones.slice(0, 2);
        }

        /**
         * Genera las cartas dobles (SIEMPRE 1 CARTA REPETIDA 2 VECES)
         */
        generarDobles(grid, barajas) {
            const total = this.getTotalCasillas(grid);
            
            // 🔥 SIEMPRE solo 1 carta doble
            if (barajas.length === 0) {
                this.cartasDobles = [];
                this.posicionesDobles = [];
                this.asignacionDobles = {};
                return { cartasDobles: [], posiciones: [], asignacion: {} };
            }
            
            // 1. Seleccionar UNA carta al azar
            const barajasMezcladas = [...barajas];
            for (let i = barajasMezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [barajasMezcladas[i], barajasMezcladas[j]] = [barajasMezcladas[j], barajasMezcladas[i]];
            }
            
            // 🔥 Solo 1 carta doble
            this.cartasDobles = [barajasMezcladas[0]];
            
            // 2. Generar 2 posiciones para esa carta
            const posiciones = this.obtenerPosicionesPorUbicacion(grid, 2);
            this.posicionesDobles = posiciones;
            
            // 3. Asignar la carta a las 2 posiciones
            this.asignacionDobles = {};
            const carta = this.cartasDobles[0];
            if (carta && posiciones.length === 2) {
                this.asignacionDobles[carta.numero] = posiciones;
            }
            
            // Guardar en estado global
            JuguemosState.cartasDobles = this.cartasDobles;
            JuguemosState.posicionesDobles = this.posicionesDobles;
            JuguemosState.asignacionDobles = this.asignacionDobles;
            JuguemosState.ubicacionDoble = this.ubicacion;
            
            console.log('📍 Dobles generados (SIEMPRE 1 carta ×2):', {
                carta: this.cartasDobles[0]?.nombre || 'Ninguna',
                posiciones: this.posicionesDobles
            });
            
            return {
                cartasDobles: this.cartasDobles,
                posiciones: this.posicionesDobles,
                asignacion: this.asignacionDobles
            };
        }

        /**
         * Actualiza el estado global
         */
        actualizarEstadoGlobal() {
            if (typeof JuguemosState === 'undefined') return;
        
            const grid = JuguemosState.grid || '4x4';
            const barajas = JuguemosState.barajas || [];
            if (barajas.length === 0) return;
        
            this.generarDobles(grid, barajas);
        }

        /**
         * Obtiene el total de casillas según el grid
         */
        getTotalCasillas(grid) {
            const mapa = {
                '4x4': 16,
                '5x5': 25,
                'pocitos4': 4,
                'pocitos3': 3,
                'cruzadas': 8
            };
            return mapa[grid] || 16;
        }

        /**
         * Obtiene columnas según el grid
         */
        getColumnasGrid(grid) {
            const mapa = {
                '4x4': 4,
                '5x5': 5,
                'pocitos4': 2,
                'pocitos3': 2,
                'cruzadas': 4
            };
            return mapa[grid] || 4;
        }

        /**
         * Obtiene filas según el grid
         */
        getFilasGrid(grid) {
            const mapa = {
                '4x4': 4,
                '5x5': 5,
                'pocitos4': 2,
                'pocitos3': 2,
                'cruzadas': 4
            };
            return mapa[grid] || 4;
        }

        // =========================================================
        // UBICACIONES ESPECÍFICAS - SIEMPRE RETORNAN 2 POSICIONES
        // =========================================================

        obtenerAleatorio(grid, cantidad, usadas) {
            const total = this.getTotalCasillas(grid);
            const disponibles = [];
            for (let i = 0; i < total; i++) {
                if (!usadas.has(i)) disponibles.push(i);
            }
            for (let i = disponibles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
            }
            return disponibles.slice(0, Math.min(cantidad, disponibles.length));
        }
        

        obtenerCentro(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para grid 4x4, el centro son las casillas 5, 6, 9, 10 (0-based)
            // Para 2 casillas: [5, 6] (centro superior)
            const centroPositions = this.getCentroPositions(grid);
            
            for (const pos of centroPositions) {
                if (posiciones.length >= cantidad) break;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            return posiciones;
        }
        
        /**
         * 🔥 NUEVO: Obtiene las posiciones centrales según el grid
         */
        getCentroPositions(grid) {
            switch(grid) {
                case '4x4':
                    // Centro: casillas 5, 6, 9, 10 (0-based)
                    // Para 2 casillas: 5, 6 (centro superior)
                    return [5, 6, 9, 10];
                case '5x5':
                    // Centro: csilla 12 (centro exacto)
                    return [12, 7, 11, 13, 17];
                case 'pocitos4':
                    return [0, 1, 2, 3];
                case 'pocitos3':
                    return [0, 1, 2];
                case 'cruzadas':
                    return [1, 2, 5, 6];
                default:
                    return [0];
            }
        }

        obtenerContraEsquinaDerIzq(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: posiciones 0 (esquina superior izquierda) y 15 (esquina inferior derecha)
            const esquinas = [0, 15];
            
            for (const pos of esquinas) {
                if (posiciones.length >= cantidad) break;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // Si faltan, buscar vecinos
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

        obtenerContraEsquinaIzqDer(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: posiciones 3 (esquina superior derecha) y 12 (esquina inferior izquierda)
            const esquinas = [3, 12];
            
            for (const pos of esquinas) {
                if (posiciones.length >= cantidad) break;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // Si faltan, buscar vecinos
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

        obtenerCentroDiagonalDerIzq(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: diagonal derecha a izquierda (de arriba-derecha a abajo-izquierda)
            // Posiciones: 3, 6, 9, 12
            // Tomar las centrales primero: 6 y 9
            const centrales = [6, 9, 3, 12];
            
            for (const pos of centrales) {
                if (posiciones.length >= cantidad) break;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            return posiciones;
        }

        obtenerCentroDiagonalIzqDer(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: diagonal izquierda a derecha (de arriba-izquierda a abajo-derecha)
            // Posiciones: 0, 5, 10, 15
            // Tomar las centrales primero: 5 y 10
            const centrales = [5, 10, 0, 15];
            
            for (const pos of centrales) {
                if (posiciones.length >= cantidad) break;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            return posiciones;
        }

        obtenerCentroHorizontal(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: fila central superior o inferior
            // Intentar fila superior primero (5,6), si no disponible, usar inferior (9,10)
            const opciones = [
                [5, 6],   // Fila 1 - centro
                [9, 10],  // Fila 2 - centro
                [4, 7],   // Fila 1 - extremos
                [8, 11]   // Fila 2 - extremos
            ];
            
            for (const opcion of opciones) {
                if (posiciones.length >= cantidad) break;
                let disponibles = opcion.filter(p => p < total && !usadas.has(p));
                for (const pos of disponibles) {
                    if (posiciones.length >= cantidad) break;
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            return posiciones;
        }   

        obtenerCentroVertical(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            // 🔥 Para 4x4: columna central izquierda o derecha
            // Intentar columna izquierda primero (5,9), si no disponible, usar derecha (6,10)
            const opciones = [
                [5, 9],   // Columna 1 - centro
                [6, 10],  // Columna 2 - centro
                [1, 13],  // Columna 1 - extremos
                [2, 14]   // Columna 2 - extremos
            ];
            
            for (const opcion of opciones) {
                if (posiciones.length >= cantidad) break;
                let disponibles = opcion.filter(p => p < total && !usadas.has(p));
                for (const pos of disponibles) {
                    if (posiciones.length >= cantidad) break;
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            return posiciones;
        }

        /**
         * Refresca la vista previa
         */
        refreshPreview() {
            if (typeof llenarCasillasAutomatico === 'function') {
                llenarCasillasAutomatico();
            }
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new DoblesManager();
        }
        return instance;
    }

    window.DoblesManager = {
        init: function() {
            getInstance();
        },
        generarDobles: function(grid, barajas) {
            return getInstance().generarDobles(grid, barajas);
        },
        refreshPreview: function() {
            getInstance().refreshPreview();
        },
        getCartasDobles: function() {
            return getInstance().cartasDobles;
        },
        getPosicionesDobles: function() {
            return getInstance().posicionesDobles;
        },
        obtenerPosicionesPorUbicacion: function(grid, cantidad) {
            return getInstance().obtenerPosicionesPorUbicacion(grid, cantidad);
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof JuguemosState !== 'undefined') {
            window.DoblesManager.init();
        } else {
            const checkState = setInterval(function() {
                if (typeof JuguemosState !== 'undefined') {
                    clearInterval(checkState);
                    window.DoblesManager.init();
                }
            }, 100);
        }
    });

    console.log('📦 Dobles.js cargado correctamente (SIEMPRE 2 casillas dobles)');

})();
