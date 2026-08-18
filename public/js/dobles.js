/**
 * =====================================================
 * DOBLES - Módulo independiente (CORREGIDO)
 * =====================================================
 */

(function() {
    'use strict';

    class DoblesManager {
        constructor() {
            this.ubicacion = 'aleatoria';
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

        bindEvents() {
            const radios = this.container.querySelectorAll('.j-ubicacion-radio-input');
            
            radios.forEach(radio => {
                radio.addEventListener('change', () => {
                    if (radio.checked) {
                        this.ubicacion = radio.dataset.ubicacion;
                        JuguemosState.ubicacionDoble = this.ubicacion;
                        
                        // 🔥 REGENERAR POSICIONES INMEDIATAMENTE
                        this.actualizarPosiciones();
                        this.actualizarEstadoGlobal();
                        
                        // 🔥 FORZAR ACTUALIZACIÓN DE LA VISTA PREVIA
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
         * 🔥 NUEVO: Actualizar posiciones sin regenerar todo
         */
        actualizarPosiciones() {
            const grid = JuguemosState.grid || '4x4';
            const barajas = JuguemosState.barajas || [];
            
            if (barajas.length === 0) return;
            
            // Generar posiciones según la ubicación seleccionada
            const posiciones = this.obtenerPosicionesPorUbicacion(grid, 2);
            this.posicionesDobles = posiciones;
            
            // Seleccionar UNA carta al azar para duplicar
            const barajasMezcladas = [...barajas];
            for (let i = barajasMezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [barajasMezcladas[i], barajasMezcladas[j]] = [barajasMezcladas[j], barajasMezcladas[i]];
            }
            
            this.cartasDobles = [barajasMezcladas[0]];
            
            // Asignar la carta a las posiciones
            this.asignacionDobles = {};
            const carta = this.cartasDobles[0];
            if (carta && posiciones.length === 2) {
                this.asignacionDobles[carta.numero] = posiciones;
            }
            
            // Guardar en estado global
            JuguemosState.cartasDobles = this.cartasDobles;
            JuguemosState.posicionesDobles = this.posicionesDobles;
            JuguemosState.asignacionDobles = this.asignacionDobles;
            
            console.log('📍 Posiciones dobles actualizadas:', {
                ubicacion: this.ubicacion,
                posiciones: this.posicionesDobles,
                carta: this.cartasDobles[0]?.nombre || 'Ninguna'
            });
        }

        /**
         * Obtiene posiciones según la ubicación seleccionada
         * SIEMPRE RETORNA 2 POSICIONES
         */
        obtenerPosicionesPorUbicacion(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            
            if (total < 2) {
                return [0];
            }
            
            let posiciones = [];
            
            // 🔥 SIEMPRE 2 posiciones
            const cantidadReal = Math.min(2, total);
            
            switch(this.ubicacion) {
                case 'aleatoria':
                    posiciones = this.obtenerAleatorio(grid, cantidadReal);
                    break;
                case 'centro':
                    posiciones = this.obtenerCentro(grid, cantidadReal);
                    break;
                case 'contra-esquina-der-izq':
                    posiciones = this.obtenerContraEsquinaDerIzq(grid, cantidadReal);
                    break;
                case 'contra-esquina-izq-der':
                    posiciones = this.obtenerContraEsquinaIzqDer(grid, cantidadReal);
                    break;
                case 'centro-diagonal-der-izq':
                    posiciones = this.obtenerCentroDiagonalDerIzq(grid, cantidadReal);
                    break;
                case 'centro-diagonal-izq-der':
                    posiciones = this.obtenerCentroDiagonalIzqDer(grid, cantidadReal);
                    break;
                case 'centro-horizontal':
                    posiciones = this.obtenerCentroHorizontal(grid, cantidadReal);
                    break;
                case 'centro-vertical':
                    posiciones = this.obtenerCentroVertical(grid, cantidadReal);
                    break;
                default:
                    posiciones = this.obtenerAleatorio(grid, cantidadReal);
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
            
            // 🔥 Guardar en estado para depuración
            console.log(`📍 Ubicación "${this.ubicacion}" en grid ${grid}:`, posiciones);
            
            return posiciones.slice(0, 2);
        }

        // =========================================================
        // 🔥 UBICACIONES CORREGIDAS PARA 4x4 Y 5x5
        // =========================================================

        obtenerAleatorio(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            const indices = Array.from({ length: total }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            return indices.slice(0, cantidad);
        }

        /**
         * CENTRO - Para 4x4: posiciones 5 y 6
         * Para 5x5: posiciones 12 y 7 (centro y uno cercano)
         */
        obtenerCentro(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            const cols = this.getColumnasGrid(grid);
            
            if (grid === '4x4') {
                // 🔥 4x4: centro = posiciones 5 y 6
                return [5, 6];
            } else if (grid === '5x5') {
                // 🔥 5x5: centro = posiciones 12 y 7 (centro y centro-superior)
                return [12, 7];
            } else if (grid === 'cruzadas') {
                // 🔥 Cruzadas: centro = posiciones 1 y 2
                return [1, 2];
            } else if (grid === 'pocitos4') {
                return [0, 1];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback
            const centro = Math.floor(total / 2);
            return [centro - 1, centro];
        }

        /**
         * CONTRA ESQUINA DERECHA A IZQUIERDA
         * 4x4: posiciones 0 y 15
         * 5x5: posiciones 0 y 24
         */
        obtenerContraEsquinaDerIzq(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            
            if (grid === '4x4') {
                return [0, 15];
            } else if (grid === '5x5') {
                return [0, 24];
            } else if (grid === 'cruzadas') {
                return [0, 7];
            } else if (grid === 'pocitos4') {
                return [0, 3];
            } else if (grid === 'pocitos3') {
                return [0, 2];
            }
            
            return [0, total - 1];
        }

        /**
         * CONTRA ESQUINA IZQUIERDA A DERECHA
         * 4x4: posiciones 3 y 12
         * 5x5: posiciones 4 y 20
         */
        obtenerContraEsquinaIzqDer(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            
            if (grid === '4x4') {
                return [3, 12];
            } else if (grid === '5x5') {
                return [4, 20];
            } else if (grid === 'cruzadas') {
                return [3, 4];
            } else if (grid === 'pocitos4') {
                return [1, 2];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback: esquina superior derecha e inferior izquierda
            return [cols - 1, (rows - 1) * cols];
        }

        /**
         * CENTRO HORIZONTAL
         * 4x4: posiciones 9 y 10 (fila central inferior)
         * 5x5: posiciones 12 y 13 (centro exacto + derecha)
         */
        obtenerCentroHorizontal(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            
            if (grid === '4x4') {
                // 🔥 4x4: fila central inferior (índices 8-11), tomar 9 y 10
                return [9, 10];
            } else if (grid === '5x5') {
                // 🔥 5x5: fila central (índices 10-14), tomar 12 y 13
                return [12, 13];
            } else if (grid === 'cruzadas') {
                // 🔥 Cruzadas: centro horizontal = posiciones 1 y 2
                return [1, 2];
            } else if (grid === 'pocitos4') {
                return [0, 1];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback
            const centroRow = Math.floor(rows / 2);
            const start = centroRow * cols;
            const centroCol = Math.floor(cols / 2);
            return [start + centroCol - 1, start + centroCol];
        }

        /**
         * CENTRO VERTICAL
         * 4x4: posiciones 6 y 10 (columna central derecha)
         * 5x5: posiciones 12 y 17 (centro exacto + abajo)
         */
        obtenerCentroVertical(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            
            if (grid === '4x4') {
                // 🔥 4x4: columna central derecha (índices 2,6,10,14), tomar 6 y 10
                return [6, 10];
            } else if (grid === '5x5') {
                // 🔥 5x5: columna central (índices 2,7,12,17,22), tomar 12 y 17
                return [12, 17];
            } else if (grid === 'cruzadas') {
                // 🔥 Cruzadas: centro vertical = posiciones 1 y 2
                return [1, 2];
            } else if (grid === 'pocitos4') {
                return [0, 2];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback
            const centroCol = Math.floor(cols / 2);
            const centroRow = Math.floor(rows / 2);
            return [centroRow * cols + centroCol, (centroRow + 1) * cols + centroCol];
        }

        /**
         * CENTRO DIAGONAL DERECHA A IZQUIERDA
         * 4x4: posiciones 5 y 10
         * 5x5: posiciones 7 y 17
         */
        obtenerCentroDiagonalDerIzq(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            
            if (grid === '4x4') {
                return [6, 9];
            } else if (grid === '5x5') {
                return [6, 18];
            } else if (grid === 'cruzadas') {
                return [1, 2];
            } else if (grid === 'pocitos4') {
                return [1, 2];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback
            const centroCol = Math.floor(cols / 2);
            const centroRow = Math.floor(rows / 2);
            return [centroRow * cols + centroCol, (centroRow + 1) * cols + (centroCol - 1)];
        }

        /**
         * CENTRO DIAGONAL IZQUIERDA A DERECHA
         * 4x4: posiciones 6 y 9
         * 5x5: posiciones 7 y 17
         */
        obtenerCentroDiagonalIzqDer(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            
            if (grid === '4x4') {
                // 🔥 Diagonal derecha→izquierda (0,5,10,15), tomar 5 y 10
                return [5, 10];
            } else if (grid === '5x5') {
                // 🔥 Diagonal derecha→izquierda (4,8,12,16,20), tomar 8 y 16
                return [8, 16];
            } else if (grid === 'cruzadas') {
                return [1, 2];
            } else if (grid === 'pocitos4') {
                return [1, 2];
            } else if (grid === 'pocitos3') {
                return [1, 2];
            }
            
            // Fallback
            const centroCol = Math.floor(cols / 2);
            const centroRow = Math.floor(rows / 2);
            return [centroRow * cols + (centroCol - 1), (centroRow + 1) * cols + centroCol];
        }

        /**
         * Genera las cartas dobles y actualiza el estado
         */
        generarDobles(grid, barajas) {
            const total = this.getTotalCasillas(grid);
            
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
            
            console.log('📍 Dobles generados:', {
                carta: this.cartasDobles[0]?.nombre || 'Ninguna',
                posiciones: this.posicionesDobles,
                ubicacion: this.ubicacion
            });
            
            return {
                cartasDobles: this.cartasDobles,
                posiciones: this.posicionesDobles,
                asignacion: this.asignacionDobles
            };
        }

        actualizarEstadoGlobal() {
            if (typeof JuguemosState === 'undefined') return;
        
            const grid = JuguemosState.grid || '4x4';
            const barajas = JuguemosState.barajas || [];
            if (barajas.length === 0) return;
        
            this.generarDobles(grid, barajas);
        }

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
        },
        // 🔥 NUEVO: Forzar actualización de posiciones
        actualizarPosiciones: function() {
            getInstance().actualizarPosiciones();
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

    console.log('📦 Dobles.js cargado correctamente (CORREGIDO)');

})();
