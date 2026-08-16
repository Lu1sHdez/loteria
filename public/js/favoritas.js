/**
 * =====================================================
 * FAVORITAS - Módulo unificado y optimizado
 * =====================================================
 */

(function() {
    'use strict';

    class FavoritasManager {
        constructor() {
            this.maxSeleccion = 12;
            this.seleccionadas = [];
            this.categoriaActual = null;
            this.ubicacion = 'aleatoria';
            
            this.populares = [3, 6, 27, 46, 4, 35, 1];

            this.categorias = {
                'personajes': {
                    nombre: '👤 Personajes',
                    numeros: [3, 4, 6, 12, 13, 14, 25, 26, 32, 34, 38, 42]
                },
                'amor': {
                    nombre: ' Amor y emociones',
                    numeros: [27, 41]
                },
                'naturaleza': {
                    nombre: '☀️ Naturaleza y clima',
                    numeros: [5, 10, 11, 23, 28, 35, 39, 46, 49]
                },
                'animales': {
                    nombre: '🐦 Animales',
                    numeros: [1, 19, 20, 24, 30, 33, 40, 45, 50, 54]
                },
                'cultura': {
                    nombre: '🎵 Cultura y tradición',
                    numeros: [16, 17, 18, 43, 47, 48, 53]
                },
                'objetos': {
                    nombre: '🔮 Objetos simbólicos',
                    numeros: [7, 8, 9, 15, 21, 22, 29, 31, 36, 44, 51, 52]
                },
                'fuerza': {
                    nombre: '⚔️ Fuerza y fortuna',
                    numeros: [2, 37]
                }
            };
            
            this.container = document.getElementById('j-favoritas-option');
            this.initialized = false; 
            this.init();
        }

        init() {
            if (!this.container) {
                console.warn('⚠️ FavoritasManager: Contenedor no encontrado');
                return;
            }
            
            const categoriasOrdenadas = Object.keys(this.categorias).sort((a, b) => {
                return this.categorias[a].nombre.localeCompare(this.categorias[b].nombre);
            });
            
            this.categoriaActual = categoriasOrdenadas[0] || Object.keys(this.categorias)[0];
            
            this.bindEvents();
            this.renderCategorias(categoriasOrdenadas);
            this.cargarGridInicial();
            this.observarBarajas();
            
            console.log('📋 FavoritasManager iniciado');
        }
        

        cargarGridInicial() {
            const barajas = this.getBarajasDelDiseno();
            
            if (barajas.length > 0) {
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
                this.initialized = true;
                console.log('✅ Favoritas: Grid inicial cargado con', barajas.length, 'barajas');
            } else {
                console.log('⏳ Favoritas: Esperando barajas...');
                this.initialized = false;
                
                let intentos = 0;
                const maxIntentos = 10;
                
                const esperarBarajas = setInterval(() => {
                    intentos++;
                    const barajasAhora = this.getBarajasDelDiseno();
                    
                    if (barajasAhora.length > 0) {
                        clearInterval(esperarBarajas);
                        this.renderGrid();
                        this.updateContador();
                        this.updateProgress();
                        this.actualizarPreviewCasillas();
                        this.initialized = true;
                        console.log('✅ Favoritas: Grid cargado después de', intentos, 'intentos');
                    } else if (intentos >= maxIntentos) {
                        clearInterval(esperarBarajas);
                        const grid = document.getElementById('j-favoritas-grid');
                        if (grid) {
                            grid.innerHTML = '<p style="color:#999;text-align:center;">Selecciona un diseño primero</p>';
                        }
                        console.log('⏳ Favoritas: No hay diseño seleccionado aún');
                    }
                }, 500);
            }
        }

        observarBarajas() {
            Object.defineProperty(JuguemosState, 'barajas', {
                get: function() {
                    return this._barajas || [];
                },
                set: function(value) {
                    this._barajas = value;
                    if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
                        setTimeout(() => {
                            window.FavoritasManagerInstance.recargarGrid();
                        }, 100);
                    }
                },
                configurable: true
            });
            
            if (!JuguemosState._barajas) {
                JuguemosState._barajas = JuguemosState.barajas || [];
            }
        }

        recargarGrid() {
            const barajas = this.getBarajasDelDiseno();
            if (barajas.length > 0) {
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
                this.initialized = true;
                console.log('🔄 Favoritas: Grid recargado con', barajas.length, 'barajas');
            }
        }

        bindEvents() {
            const btnAleatoria = document.getElementById('j-favoritas-aleatoria');
            if (btnAleatoria) {
                btnAleatoria.addEventListener('click', () => {
                    this.seleccionAleatoria();
                });
            }
        
            document.querySelectorAll('.j-ubicacion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.j-ubicacion-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.ubicacion = btn.dataset.ubicacion;
                    JuguemosState.favoritasUbicacion = this.ubicacion;
                    this.actualizarPreviewCasillas();
                    
                    if (typeof llenarCasillasAutomatico === 'function') {
                        setTimeout(() => llenarCasillasAutomatico(), 100);
                    }
                });
            });
        }

        renderCategorias(categoriasOrdenadas) {
            const container = document.getElementById('j-favoritas-categorias');
            if (!container) return;
            
            container.innerHTML = '';
            
            categoriasOrdenadas.forEach(key => {
                const cat = this.categorias[key];
                if (!cat) return;
                
                const btn = document.createElement('button');
                btn.className = `j-favoritas-categoria-btn${key === this.categoriaActual ? ' active' : ''}`;
                btn.dataset.categoria = key;
                btn.textContent = cat.nombre;
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.j-favoritas-categoria-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.categoriaActual = key;
                    this.renderGrid();
                });
                container.appendChild(btn);
            });
        }

        // =========================================================
        // GENERAR DISTRIBUCIÓN (ÚNICA VERSIÓN)
        // =========================================================

        generarDistribucionInteligente() {
            const grid = JuguemosState.grid || '4x4';
            const ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
            const totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            const favoritas = this.seleccionadas || [];
        
            if (favoritas.length === 0) {
                JuguemosState.favoritasEstructura = [];
                JuguemosState.favoritasDistribucion = [];
                return;
            }
        
            // 🔥 PARA POCITOS 3 - Forzar posición 1 (superior derecha)
            if (grid === 'pocitos3') {
                // Crear estructura con la favorita en la posición 1
                const estructura = [];
                for (let t = 0; t < totalTablas; t++) {
                    const favoritaTabla = t === 0 && favoritas.length > 0 ? [favoritas[0]] : [];
                    const posiciones = favoritaTabla.length > 0 ? [{ posicion: 1, favorita: favoritas[0] }] : [];
                    
                    estructura.push({
                        tablaIndex: t,
                        favoritas: favoritaTabla,
                        posiciones: posiciones,
                        cantidad: favoritaTabla.length
                    });
                }
                
                JuguemosState.favoritasEstructura = estructura;
                JuguemosState.favoritasDistribucion = estructura.map(t => t.favoritas);
                
                if (typeof drawGrid === 'function') {
                    drawGrid();
                }
                return estructura;
            }
        
            // 🔥 OTROS GRIDS - Comportamiento normal
            const estructura = FavoritasLogic.generarEstructuraCompleta(
                favoritas,
                totalTablas,
                grid,
                ubicacion
            );
        
            JuguemosState.favoritasEstructura = estructura;
            JuguemosState.favoritasDistribucion = estructura.map(t => t.favoritas);
            
            if (typeof drawGrid === 'function') {
                drawGrid();
            }
            
            return estructura;
        }

        // =========================================================
        // VISTA PREVIA DE CASILLAS
        // =========================================================

        actualizarPreviewCasillas() {
            console.log('🔄 actualizarPreviewCasillas - Favoritas:', this.seleccionadas.length);
            console.log('🔄 actualizarPreviewCasillas - Ubicacion:', this.ubicacion);
            
            JuguemosState.favoritas = this.seleccionadas;
            JuguemosState.favoritasUbicacion = this.ubicacion;
            
            // PRIMERO: Generar estructura
            this.generarDistribucionInteligente();
            
            // LUEGO: Mostrar vista previa
            const grid = JuguemosState.grid || '4x4';
            const totalCasillas = this.getTotalCasillas(grid);
            const container = document.getElementById('j-casilla-preview-grid');
            if (!container) return;
            
            container.dataset.grid = grid;
            
            // Configuración especial para Pocitos 3
            if (grid === 'pocitos3') {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.gridTemplateRows = 'repeat(2, 1fr)';
            } else {
                container.style.gridTemplateColumns = '';
                container.style.gridTemplateRows = '';
            }
            
            // 🔥 SI ES POCITOS 3 - SIEMPRE CASILLA 2 (superior derecha)
            if (grid === 'pocitos3') {
                // POSICIÓN 0 = izquierda
                // POSICIÓN 1 = superior derecha ← SIEMPRE AQUÍ
                // POSICIÓN 2 = inferior derecha
                
                let html = '';
                for (let i = 0; i < totalCasillas; i++) {
                    // SOLO la posición 1 (superior derecha) puede tener favorita
                    const esFavorita = (i === 1) && this.seleccionadas.length > 0;
                    const casilla = esFavorita ? this.seleccionadas[0] : null;
                    
                    if (esFavorita && casilla) {
                        html += `
                            <div class="cell favorita" data-index="${i}" title="${casilla.nombre}  Favorita">
                                <img src="${casilla.imagen}" alt="${casilla.nombre}" loading="lazy">
                            </div>
                        `;
                    } else {
                        html += `<div class="cell empty" data-index="${i}"></div>`;
                    }
                }
                container.innerHTML = html;
                return;
            }
            
            // 🔥 OTROS GRIDS - Comportamiento normal
            if (this.seleccionadas.length === 0) {
                container.innerHTML = Array(totalCasillas)
                    .fill('<div class="cell empty"></div>')
                    .join('');
                return;
            }
            
            const estructura = JuguemosState.favoritasEstructura;
            if (estructura && estructura.length > 0) {
                this.mostrarPreviewConEstructura(estructura);
            } else {
                // Fallback seguro
                const posiciones = FavoritasLogic.getPosicionesPorUbicacion(this.ubicacion, grid, this.seleccionadas.length);
                let html = '';
                for (let i = 0; i < totalCasillas; i++) {
                    const esFavorita = posiciones.includes(i);
                    let baraja = null;
                    if (esFavorita) {
                        const idx = posiciones.indexOf(i);
                        if (idx < this.seleccionadas.length) {
                            baraja = this.seleccionadas[idx];
                        }
                    }
                    if (baraja) {
                        html += `
                            <div class="cell favorita" data-index="${i}" title="${baraja.nombre}  Favorita">
                                <img src="${baraja.imagen}" alt="${baraja.nombre}" loading="lazy">
                            </div>
                        `;
                    } else {
                        html += `<div class="cell empty" data-index="${i}"></div>`;
                    }
                }
                container.innerHTML = html;
            }
        }

        mostrarPreviewConEstructura(estructura) {
            const container = document.getElementById('j-casilla-preview-grid');
            if (!container) return;
            
            const grid = JuguemosState.grid || '4x4';
            const total = FavoritasLogic.getGridConfig(grid).total;
            
            // 🔥 PARA POCITOS 3 - SIEMPRE CASILLA 2 (superior derecha)
            if (grid === 'pocitos3') {
                let html = '';
                for (let i = 0; i < total; i++) {
                    // SOLO la posición 1 (superior derecha) puede tener favorita
                    const esFavorita = (i === 1) && this.seleccionadas.length > 0;
                    const casilla = esFavorita ? this.seleccionadas[0] : null;
                    
                    if (esFavorita && casilla) {
                        html += `
                            <div class="cell favorita" data-index="${i}">
                                <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                            </div>
                        `;
                    } else {
                        html += `<div class="cell empty" data-index="${i}"></div>`;
                    }
                }
                container.innerHTML = html;
                return;
            }
            
            // 🔥 OTROS GRIDS - Comportamiento normal
            const primeraTabla = estructura[0] || { posiciones: [] };
            const posiciones = primeraTabla.posiciones || [];
            
            const casillas = Array(total).fill(null);
            posiciones.forEach(item => {
                if (item.posicion < total) {
                    casillas[item.posicion] = item.favorita;
                }
            });
            
            let html = '';
            for (let i = 0; i < total; i++) {
                const casilla = casillas[i];
                const esFavorita = casilla !== null && casilla !== undefined;
                
                if (esFavorita) {
                    html += `
                        <div class="cell favorita" data-index="${i}">
                            <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        </div>
                    `;
                } else {
                    html += `<div class="cell empty" data-index="${i}"></div>`;
                }
            }
            
            container.innerHTML = html;
        }

        // =========================================================
        // RENDERIZADO DEL GRID DE SELECCIÓN
        // =========================================================

        renderGrid() {
            const grid = document.getElementById('j-favoritas-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            const cat = this.categorias[this.categoriaActual];
            if (!cat || !cat.numeros || cat.numeros.length === 0) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">No hay barajas en esta categoría</p>';
                return;
            }
            
            const barajasDisponibles = this.getBarajasDelDiseno();
            
            if (barajasDisponibles.length === 0) {
                grid.innerHTML = `
                    <p style="color:#999;text-align:center;padding:20px;">
                        Selecciona un diseño primero<br>
                        <span style="font-size:12px;color:#ccc;">Las barajas aparecerán automáticamente</span>
                    </p>
                `;
                return;
            }
            
            let encontradas = 0;
            cat.numeros.forEach(numero => {
                const baraja = barajasDisponibles.find(b => parseInt(b.numero) === numero);
                if (!baraja) return;
                
                encontradas++;
                const isSelected = this.seleccionadas.some(s => parseInt(s.numero) === numero);
                const isPopular = this.populares.includes(numero);
                
                const item = document.createElement('div');
                item.className = `j-favoritas-item${isSelected ? ' selected' : ''}`;
                
                let html = `
                    <img src="${baraja.imagen}" alt="${baraja.nombre}" loading="lazy">
                    ${isSelected ? '<span class="j-heart-center"></span>' : ''}
                    <span class="j-favoritas-nombre">${baraja.nombre}</span>
                    <span class="j-check-circle">✓</span>
                `;
                
                if (isPopular) {
                    html += `<span class="j-popular-badge"><span class="heart"></span> Popular</span>`;
                }
                
                item.innerHTML = html;
                
                item.addEventListener('click', () => {
                    this.toggleSeleccion(baraja);
                });
                
                grid.appendChild(item);
            });
            if (encontradas === 0) {
                grid.innerHTML = `
                    <p class="j-favoritas-grid-wrapper">
                        <span class="j-favoritas-mensaje">Prueba con otra categoría</span>
                    </p>
                `;
            }
        }

        // =========================================================
        // SELECCIÓN DE FAVORITAS
        // =========================================================

        toggleSeleccion(baraja) {
            const numero = parseInt(baraja.numero);
            const index = this.seleccionadas.findIndex(s => parseInt(s.numero) === numero);
            
            // 🔥 SI ES POCITOS 3 - Comportamiento especial (1 favorita a la vez)
            if (JuguemosState.grid === 'pocitos3') {
                // Si ya está seleccionada, la desmarcamos
                if (index !== -1) {
                    this.seleccionadas.splice(index, 1);
                } else {
                    // Si hay otra favorita seleccionada, la reemplazamos
                    if (this.seleccionadas.length === 1) {
                        // Remover la actual y agregar la nueva
                        this.seleccionadas = [];
                    }
                    this.seleccionadas.push(baraja);
                }
                
                // Actualizar UI
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
                
                if (typeof llenarCasillasAutomatico === 'function') {
                    setTimeout(() => {
                        llenarCasillasAutomatico();
                    }, 100);
                }
                return;
            }
            
            // 🔥 COMPORTAMIENTO NORMAL PARA OTROS GRIDS
            if (index !== -1) {
                this.seleccionadas.splice(index, 1);
            } else {
                if (this.seleccionadas.length >= this.maxSeleccion) {
                    alert(`Solo puedes seleccionar ${this.maxSeleccion} favoritas.`);
                    return;
                }
                this.seleccionadas.push(baraja);
            }
            
            // Actualizar UI
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarPreviewCasillas();
            
            if (typeof llenarCasillasAutomatico === 'function') {
                setTimeout(() => {
                    llenarCasillasAutomatico();
                }, 100);
            }
        }

        seleccionAleatoria() {
            const barajas = this.getBarajasDelDiseno();
            if (barajas.length === 0) {
                alert('Primero selecciona un diseño.');
                return;
            }
            
            // 🔥 PARA POCITOS 3 - Solo 1 favorita
            let limite = this.maxSeleccion;
            if (JuguemosState.grid === 'pocitos3') {
                limite = 1;
            }
            
            const mezcladas = [...barajas];
            for (let i = mezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
            }
            
            this.seleccionadas = mezcladas.slice(0, limite);
            
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarPreviewCasillas();
            
            if (typeof llenarCasillasAutomatico === 'function') {
                setTimeout(() => {
                    llenarCasillasAutomatico();
                }, 100);
            }
        }

        // =========================================================
        // ACTUALIZACIÓN DE UI
        // =========================================================

        updateContador() {
            const total = this.seleccionadas.length;
            
            const counter = document.getElementById('j-favoritas-seleccionadas');
            const count = document.getElementById('j-favoritas-count');
            const circle = document.getElementById('j-favoritas-counter-circle');
            
            if (counter) counter.textContent = total;
            if (count) count.textContent = total;
            if (circle) {
                circle.classList.toggle('complete', total === this.maxSeleccion);
            }
        }

        updateProgress() {
            const total = this.seleccionadas.length;
            
            const range = document.getElementById('j-favoritas-progress-range');
            const number = document.getElementById('j-favoritas-progress-number');
            
            if (range) {
                range.value = total;
                const percentage = (total / this.maxSeleccion) * 100;
                range.style.background = `linear-gradient(to right, #FA299C 0%, #FA299C ${percentage}%, #E5E5E5 ${percentage}%, #E5E5E5 100%)`;
            }
            if (number) {
                number.textContent = total;
            }
        }

        // =========================================================
        // FUNCIONES AUXILIARES
        // =========================================================

        getBarajasDelDiseno() {
            return (JuguemosState.barajas && JuguemosState.barajas.length > 0) 
                ? JuguemosState.barajas 
                : [];
        }

        getTotalCasillas(grid) {
            return FavoritasLogic.getGridConfig(grid).total;
        }

        getColumnasGrid(grid) {
            return FavoritasLogic.getGridConfig(grid).cols;
        }

        getFilasGrid(grid) {
            return FavoritasLogic.getGridConfig(grid).rows;
        }

        // =========================================================
        // MÉTODOS PÚBLICOS
        // =========================================================

        getFavoritas() {
            return this.seleccionadas;
        }

        getUbicacion() {
            return this.ubicacion;
        }

        regenerarPreview() {
            this.actualizarPreviewCasillas();
        }

        recargar() {
            this.recargarGrid();
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new FavoritasManager();
        }
        return instance;
    }

    window.FavoritasManager = {
        init: function() {
            return getInstance();
        },
        getFavoritas: function() {
            return getInstance().getFavoritas();
        },
        getUbicacion: function() {
            return getInstance().getUbicacion();
        },
        regenerarPreview: function() {
            getInstance().regenerarPreview();
        },
        actualizarCasillas: function() {
            getInstance().actualizarPreviewCasillas();
        },
        seleccionAleatoria: function() {
            getInstance().seleccionAleatoria();
        },
        recargar: function() {
            getInstance().recargar();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (typeof JuguemosState !== 'undefined') {
            window.FavoritasManagerInstance = window.FavoritasManager.init();
        } else {
            const checkState = setInterval(() => {
                if (typeof JuguemosState !== 'undefined') {
                    clearInterval(checkState);
                    window.FavoritasManagerInstance = window.FavoritasManager.init();
                }
            }, 100);
        }
    });
})();
