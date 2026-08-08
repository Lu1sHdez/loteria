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
                        
                        // Forzar regeneración de tablas
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
         * Actualiza la vista previa de ubicación con los ×2
         * SIEMPRE SOLO 2 CASILLAS
         */
        actualizarPreviewUbicacion() {
            const grid = JuguemosState.grid || '4x4';
            const total = this.getTotalCasillas(grid);
            const container = document.getElementById('j-grid-preview');
            
            if (!container) return;
            
            // 🔥 SIEMPRE 2 posiciones para dobles
            const posiciones = this.obtenerPosicionesPorUbicacion(grid, 2);
            
            // Crear celdas con imagen ×2
            let html = '';
            for (let i = 0; i < total; i++) {
                const esDoble = posiciones.includes(i);
                html += `<div class="cell ${esDoble ? 'doble-ubicacion' : ''}">
                    ${esDoble ? '<img src="/wp-content/uploads/2026/08/doblesx2.png" class="j-doble-imagen" alt="×2" loading="lazy">' : ''}
                </div>`;
            }
            
            container.innerHTML = html;
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
            
            this.actualizarPreviewUbicacion();
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
            const centroCol = Math.floor(cols / 2);
            const centroRow = Math.floor(rows / 2);
            
            const direcciones = [
                [0, 0], [0, 1], [1, 0], [0, -1], [-1, 0],
                [1, 1], [1, -1], [-1, 1], [-1, -1],
                [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [2, -1], [2, -2],
                [1, -2], [0, -2], [-1, -2], [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2]
            ];
            
            for (const [dr, dc] of direcciones) {
                if (posiciones.length >= cantidad) break;
                const r = centroRow + dr;
                const c = centroCol + dc;
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    const pos = r * cols + c;
                    if (!usadas.has(pos)) {
                        posiciones.push(pos);
                        usadas.add(pos);
                    }
                }
            }
            
            return posiciones;
        }

        obtenerContraEsquinaDerIzq(grid, cantidad, usadas) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            
            for (let i = 0; i < Math.min(cols, rows) && posiciones.length < cantidad; i++) {
                const pos = i * cols + (cols - 1 - i);
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                for (let i = 0; i < Math.min(cols, rows) && posiciones.length < cantidad; i++) {
                    const pos = i * cols + (cols - 1 - i);
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    const vecinos = [
                        (row - 1) * cols + col, (row + 1) * cols + col,
                        row * cols + (col - 1), row * cols + (col + 1)
                    ];
                    for (const v of vecinos) {
                        if (v >= 0 && v < total && !usadas.has(v) && posiciones.length < cantidad) {
                            posiciones.push(v);
                            usadas.add(v);
                        }
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
            
            for (let i = 0; i < Math.min(cols, rows) && posiciones.length < cantidad; i++) {
                const pos = i * cols + i;
                if (pos < total && !usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                for (let i = 0; i < Math.min(cols, rows) && posiciones.length < cantidad; i++) {
                    const pos = i * cols + i;
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    const vecinos = [
                        (row - 1) * cols + col, (row + 1) * cols + col,
                        row * cols + (col - 1), row * cols + (col + 1)
                    ];
                    for (const v of vecinos) {
                        if (v >= 0 && v < total && !usadas.has(v) && posiciones.length < cantidad) {
                            posiciones.push(v);
                            usadas.add(v);
                        }
                    }
                }
            }
            
            return posiciones;
        }

        obtenerCentroDiagonalDerIzq(grid, cantidad, usadas) {
            const posiciones = [];
            
            const centroPos = this.obtenerCentro(grid, Math.min(4, cantidad), usadas);
            for (const p of centroPos) {
                if (!usadas.has(p) && posiciones.length < cantidad) {
                    posiciones.push(p);
                    usadas.add(p);
                }
            }
            
            if (posiciones.length < cantidad) {
                const diagonal = this.obtenerContraEsquinaDerIzq(grid, cantidad - posiciones.length, usadas);
                for (const p of diagonal) {
                    if (!usadas.has(p) && posiciones.length < cantidad) {
                        posiciones.push(p);
                        usadas.add(p);
                    }
                }
            }
            
            return posiciones;
        }

        obtenerCentroDiagonalIzqDer(grid, cantidad, usadas) {
            const posiciones = [];
            
            const centroPos = this.obtenerCentro(grid, Math.min(4, cantidad), usadas);
            for (const p of centroPos) {
                if (!usadas.has(p) && posiciones.length < cantidad) {
                    posiciones.push(p);
                    usadas.add(p);
                }
            }
            
            if (posiciones.length < cantidad) {
                const diagonal = this.obtenerContraEsquinaIzqDer(grid, cantidad - posiciones.length, usadas);
                for (const p of diagonal) {
                    if (!usadas.has(p) && posiciones.length < cantidad) {
                        posiciones.push(p);
                        usadas.add(p);
                    }
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
            const centroRow = Math.floor(rows / 2);
            
            for (let c = 0; c < cols && posiciones.length < cantidad; c++) {
                const pos = centroRow * cols + c;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                for (let offset = 1; offset < rows && posiciones.length < cantidad; offset++) {
                    const filas = [centroRow - offset, centroRow + offset];
                    for (const r of filas) {
                        if (r < 0 || r >= rows) continue;
                        for (let c = 0; c < cols && posiciones.length < cantidad; c++) {
                            const pos = r * cols + c;
                            if (!usadas.has(pos)) {
                                posiciones.push(pos);
                                usadas.add(pos);
                            }
                        }
                    }
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
            const centroCol = Math.floor(cols / 2);
            
            for (let r = 0; r < rows && posiciones.length < cantidad; r++) {
                const pos = r * cols + centroCol;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            if (posiciones.length < cantidad) {
                for (let offset = 1; offset < cols && posiciones.length < cantidad; offset++) {
                    const colsOffset = [centroCol - offset, centroCol + offset];
                    for (const c of colsOffset) {
                        if (c < 0 || c >= cols) continue;
                        for (let r = 0; r < rows && posiciones.length < cantidad; r++) {
                            const pos = r * cols + c;
                            if (!usadas.has(pos)) {
                                posiciones.push(pos);
                                usadas.add(pos);
                            }
                        }
                    }
                }
            }
            
            return posiciones;
        }

        /**
         * Refresca la vista previa
         */
        refreshPreview() {
            this.actualizarEstadoGlobal();
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
