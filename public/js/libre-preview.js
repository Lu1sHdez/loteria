/**
 * =====================================================
 * LIBRE PREVIEW - Vista previa de casillas en modo Libre
 * =====================================================
 */

(function() {
    'use strict';

    class LibrePreview {
        constructor() {
            this.container = document.getElementById('j-casilla-preview-grid');
            this.ultimaActualizacion = 0;
            this.init();
        }

        init() {
            if (!this.container) {
                console.warn('⚠️ LibrePreview: Contenedor no encontrado');
                return;
            }

            // Escuchar cambios en libreImages
            this.observarCambios();

            // Escuchar cambios de grid
            this.observarGrid();

            // Actualizar inicial
            setTimeout(() => this.actualizar(), 300);

            console.log('📦 LibrePreview iniciado');
        }

        /**
         * Observa cambios en JuguemosState.libreImages
         */
        observarCambios() {
            const originalUpdate = JuguemosState._actualizarLibre;
            
            // Interceptar actualización de libreImages
            Object.defineProperty(JuguemosState, 'libreImages', {
                set: (value) => {
                    this._libreImages = value;
                    this.actualizar();
                },
                get: () => this._libreImages || [],
                configurable: true
            });

            // También observar cambios manuales
            setInterval(() => {
                const count = JuguemosState.libreImagesCount || 0;
                if (count !== this.ultimaActualizacion) {
                    this.ultimaActualizacion = count;
                    this.actualizar();
                }
            }, 500);
        }

        /**
         * Observa cambios en el grid
         */
        observarGrid() {
            const gridSelector = document.querySelector('.j-grid.active');
            if (gridSelector) {
                const observer = new MutationObserver(() => {
                    this.actualizar();
                });
                observer.observe(gridSelector, { attributes: true, attributeFilter: ['class'] });
            }

            // También escuchar clicks en los botones de grid
            document.querySelectorAll('.j-grid').forEach(btn => {
                btn.addEventListener('click', () => {
                    setTimeout(() => this.actualizar(), 100);
                });
            });
        }

        /**
         * Actualiza la vista previa de casillas para modo Libre
         */
        actualizar() {
            // Solo ejecutar si estamos en modo Libre
            if (JuguemosState.mode !== 'libre') {
                // Si no es Libre, no hacemos nada (deja que app.js maneje)
                return;
            }

            const grid = JuguemosState.grid || '4x4';
            const total = this.getTotalCasillas(grid);
            const images = JuguemosState.libreImages || [];
            const count = images.length;

            if (!this.container) return;

            // Configurar grid
            this.container.dataset.grid = grid;
            this.container.style.gridTemplateColumns = this.getGridTemplate(grid);
            this.container.style.gridTemplateRows = this.getGridTemplate(grid);

            // Limpiar contenedor
            this.container.innerHTML = '';

            // Generar celdas
            for (let i = 0; i < total; i++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (i < count && images[i]) {
                    // Mostrar imagen
                    const img = document.createElement('img');
                    img.src = images[i].data || images[i];
                    img.alt = `Libre ${i + 1}`;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';
                    img.style.display = 'block';
                    img.loading = 'lazy';

                    cell.appendChild(img);

                    // Número de baraja
                    const number = document.createElement('span');
                    number.className = 'cell-number';
                    number.textContent = i + 1;
                    number.style.position = 'absolute';
                    number.style.bottom = '2px';
                    number.style.right = '4px';
                    number.style.fontSize = '9px';
                    number.style.fontWeight = '700';
                    number.style.color = 'rgba(255,255,255,0.85)';
                    number.style.background = 'rgba(0,0,0,0.5)';
                    number.style.padding = '0 4px';
                    number.style.borderRadius = '3px';
                    number.style.fontFamily = 'Cairo, sans-serif';
                    number.style.lineHeight = '1.4';

                    cell.appendChild(number);
                    cell.style.background = '#fff';
                } else {
                    // Celda vacía
                    cell.classList.add('empty');
                    cell.textContent = i < count ? '' : '?';
                    cell.style.background = '#DDDDDD';
                    cell.style.display = 'flex';
                    cell.style.alignItems = 'center';
                    cell.style.justifyContent = 'center';
                    cell.style.fontSize = '24px';
                    cell.style.fontWeight = '700';
                    cell.style.color = '#aaa';
                    cell.style.fontFamily = 'Cairo, sans-serif';
                }

                // Posicionamiento especial para Cruzadas
                if (grid === 'cruzadas') {
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

                // Estilo común de celda
                cell.style.borderRadius = '4px';
                cell.style.aspectRatio = '2 / 3';
                cell.style.width = '100%';
                cell.style.height = 'auto';
                cell.style.minHeight = '35px';
                cell.style.position = 'relative';
                cell.style.overflow = 'hidden';

                this.container.appendChild(cell);
            }

            this.ultimaActualizacion = count;

            // Actualizar el resumen (opcional)
            if (typeof updateOrderSummary === 'function') {
                updateOrderSummary();
            }
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
         * Obtiene el template de grid CSS
         */
        getGridTemplate(grid) {
            const mapa = {
                '4x4': 'repeat(4, 1fr)',
                '5x5': 'repeat(5, 1fr)',
                'pocitos4': 'repeat(2, 1fr)',
                'pocitos3': 'repeat(2, 1fr)',
                'cruzadas': 'repeat(4, 1fr)'
            };
            return mapa[grid] || 'repeat(4, 1fr)';
        }

        /**
         * Forzar actualización (público)
         */
        refresh() {
            this.actualizar();
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new LibrePreview();
        }
        return instance;
    }

    window.LibrePreview = {
        init: function() {
            getInstance();
        },
        refresh: function() {
            getInstance().refresh();
        }
    };

    // Inicializar automáticamente cuando esté listo
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof JuguemosState !== 'undefined') {
            window.LibrePreview.init();
        } else {
            const checkState = setInterval(function() {
                if (typeof JuguemosState !== 'undefined') {
                    clearInterval(checkState);
                    window.LibrePreview.init();
                }
            }, 100);
        }
    });

    console.log('📦 LibrePreview.js cargado correctamente');

})();
