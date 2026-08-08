/**
 * =====================================================
 * FAVORITAS - Módulo unificado y optimizado
 * =====================================================
 */

(function() {
    'use strict';

    class FavoritasManager {
        constructor() {
            // Configuración
            this.maxSeleccion = 12;
            this.seleccionadas = [];
            this.categoriaActual = null;
            this.ubicacion = 'aleatoria';
            
            // ⭐ Barajas populares (por número)
            this.populares = [3, 6, 17, 18, 4, 7, 19, 1];
            
            // 📂 Categorías predefinidas
            this.categorias = {
                'personajes': {
                    nombre: '👤 Personajes',
                    numeros: [3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 7]
                },
                'amor': {
                    nombre: '❤️ Amor y emociones',
                    numeros: [6, 16]
                },
                'naturaleza': {
                    nombre: '☀️ Naturaleza y clima',
                    numeros: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27]
                },
                'animales': {
                    nombre: '🐦 Animales',
                    numeros: [1, 2, 28, 29, 30, 31, 32, 33, 34]
                },
                'cultura': {
                    nombre: '🎵 Cultura y tradición',
                    numeros: [35, 36, 37, 38]
                },
                'objetos': {
                    nombre: '🔮 Objetos simbólicos',
                    numeros: [39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50]
                },
                'fuerza': {
                    nombre: '⚔️ Fuerza y fortuna',
                    numeros: [5, 1, 39, 34]
                }
            };
            
            this.container = document.getElementById('j-favoritas-option');
            this.initialized = false; // ✅ Flag para controlar inicialización
            this.init();
        }

        // =========================================================
        // INICIALIZACIÓN
        // =========================================================

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
            
            // ✅ INICIALIZAR: Esperar a que las barajas estén cargadas
            this.cargarGridInicial();
            
            // ✅ Suscribirse a cambios en barajas
            this.observarBarajas();
            
            console.log('📋 FavoritasManager iniciado');
        }

        // =========================================================
        // 🔥 NUEVO: Cargar grid inicial con retry
        // =========================================================

        cargarGridInicial() {
            const barajas = this.getBarajasDelDiseno();
            
            if (barajas.length > 0) {
                // ✅ Ya hay barajas, renderizar directamente
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
                this.initialized = true;
                console.log('✅ Favoritas: Grid inicial cargado con', barajas.length, 'barajas');
            } else {
                // ⏳ Esperar a que se carguen las barajas
                console.log('⏳ Favoritas: Esperando barajas...');
                this.initialized = false;
                
                // Intentar cada 500ms hasta 5 segundos
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
                        // 🔥 Mostrar mensaje de "Selecciona un diseño"
                        const grid = document.getElementById('j-favoritas-grid');
                        if (grid) {
                            grid.innerHTML = '<p style="color:#999;text-align:center;">Selecciona un diseño primero</p>';
                        }
                        console.log('⏳ Favoritas: No hay diseño seleccionado aún');
                    }
                }, 500);
            }
        }

        // =========================================================
        // 🔥 NUEVO: Observar cambios en barajas
        // =========================================================

        observarBarajas() {
            // Guardar referencia al setter original
            const originalBarajas = Object.getOwnPropertyDescriptor(JuguemosState, 'barajas');
            
            // Interceptar cambios en barajas
            Object.defineProperty(JuguemosState, 'barajas', {
                get: function() {
                    return this._barajas || [];
                },
                set: function(value) {
                    this._barajas = value;
                    
                    // ✅ Si el modo es favoritas y el manager está activo
                    if (JuguemosState.mode === 'favoritas' && window.FavoritasManagerInstance) {
                        // Esperar un momento para que el DOM se actualice
                        setTimeout(() => {
                            window.FavoritasManagerInstance.recargarGrid();
                        }, 100);
                    }
                },
                configurable: true
            });
            
            // Inicializar con valor actual
            if (!JuguemosState._barajas) {
                JuguemosState._barajas = JuguemosState.barajas || [];
            }
        }

        // =========================================================
        // 🔥 NUEVO: Recargar grid cuando cambian las barajas
        // =========================================================

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

        // =========================================================
        // EVENTOS
        // =========================================================

        bindEvents() {
            // Botón selección aleatoria
            const btnAleatoria = document.getElementById('j-favoritas-aleatoria');
            if (btnAleatoria) {
                btnAleatoria.addEventListener('click', () => {
                    this.seleccionAleatoria();
                });
            }
        
            // Botones de ubicación
            document.querySelectorAll('.j-ubicacion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.j-ubicacion-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.ubicacion = btn.dataset.ubicacion;
                    
                    // ✅ Actualizar estado global
                    JuguemosState.favoritasUbicacion = this.ubicacion;
                    
                    // ✅ Regenerar vista previa
                    this.actualizarPreviewCasillas();
                    
                    // ✅ Forzar regeneración de tablas
                    if (typeof llenarCasillasAutomatico === 'function') {
                        setTimeout(() => llenarCasillasAutomatico(), 100);
                    }
                });
            });
        }

        // =========================================================
        // RENDERIZADO DE CATEGORÍAS
        // =========================================================

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
        // RENDERIZADO DEL GRID (MEJORADO)
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
            
            // 🔥 MEJORADO: Mensaje más claro cuando no hay diseño
            if (barajasDisponibles.length === 0) {
                grid.innerHTML = `
                    <p style="color:#999;text-align:center;padding:20px;">
                        🎯 Selecciona un diseño primero<br>
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
                    <span class="j-favoritas-nombre">${baraja.nombre}</span>
                    <span class="j-check-circle">✓</span>
                `;
                
                if (isPopular) {
                    html += `<span class="j-popular-badge"><span class="heart">❤️</span> Popular</span>`;
                }
                
                item.innerHTML = html;
                
                item.addEventListener('click', () => {
                    this.toggleSeleccion(baraja);
                });
                
                grid.appendChild(item);
            });
            
            if (encontradas === 0) {
                grid.innerHTML = `
                    <p style="color:#999;text-align:center;padding:20px;">
                        No hay barajas en esta categoría<br>
                        <span style="font-size:12px;color:#ccc;">Prueba con otra categoría</span>
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
            
            if (index !== -1) {
                this.seleccionadas.splice(index, 1);
            } else {
                if (this.seleccionadas.length >= this.maxSeleccion) {
                    alert(`Solo puedes seleccionar ${this.maxSeleccion} favoritas.`);
                    return;
                }
                this.seleccionadas.push(baraja);
            }
            
            // ✅ Actualizar todo
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarPreviewCasillas();
        }

        seleccionAleatoria() {
            const barajas = this.getBarajasDelDiseno();
            if (barajas.length === 0) {
                alert('Primero selecciona un diseño.');
                return;
            }
            
            const mezcladas = [...barajas];
            for (let i = mezcladas.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mezcladas[i], mezcladas[j]] = [mezcladas[j], mezcladas[i]];
            }
            
            this.seleccionadas = mezcladas.slice(0, this.maxSeleccion);
            
            // ✅ Actualizar todo
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarPreviewCasillas();
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
        // 🎯 MÉTODO PRINCIPAL: ACTUALIZAR VIST PREVIA DE CASILLAS
        // =========================================================

        actualizarPreviewCasillas() {
            // Actualizar estado global
            JuguemosState.favoritas = this.seleccionadas;
            JuguemosState.favoritasUbicacion = this.ubicacion;
            
            // Obtener grid actual
            const grid = JuguemosState.grid || '4x4';
            const totalCasillas = this.getTotalCasillas(grid);
            
            // Obtener el contenedor de vista previa
            const container = document.getElementById('j-casilla-preview-grid');
            if (!container) return;
            
            // Configurar grid
            container.dataset.grid = grid;
            
            // 🔥 Si no hay favoritas, mostrar vacío
            if (this.seleccionadas.length === 0) {
                container.innerHTML = Array(totalCasillas)
                    .fill('<div class="cell empty"></div>')
                    .join('');
                return;
            }
            
            // ✅ OBTENER POSICIONES SEGÚN UBICACIÓN
            const posiciones = this.obtenerPosicionesUbicacion(grid, this.seleccionadas.length);
            
            // 🔥 CONSTRUIR VISTA PREVIA
            let html = '';
            const favoritasNumeros = this.seleccionadas.map(f => parseInt(f.numero));
            
            for (let i = 0; i < totalCasillas; i++) {
                const esFavorita = posiciones.includes(i);
                let baraja = null;
                
                if (esFavorita) {
                    // Encontrar qué favorita va en esta posición
                    const idx = posiciones.indexOf(i);
                    if (idx < this.seleccionadas.length) {
                        baraja = this.seleccionadas[idx];
                    }
                }
                
                if (baraja) {
                    html += `
                        <div class="cell favorita" data-index="${i}" title="${baraja.nombre} ⭐ Favorita">
                            <img src="${baraja.imagen}" alt="${baraja.nombre}" loading="lazy">
                            <span class="j-favorita-badge">⭐</span>
                        </div>
                    `;
                } else {
                    html += `<div class="cell empty" data-index="${i}"></div>`;
                }
            }
            
            container.innerHTML = html;
            
            // ✅ Log para depuración
            console.log('📍 Vista previa actualizada:', {
                ubicacion: this.ubicacion,
                favoritas: this.seleccionadas.length,
                posiciones: posiciones,
                total: totalCasillas
            });
        }

        // =========================================================
        // 🧠 ALGORITMO DE UBICACIÓN DE FAVORITAS
        // =========================================================

        obtenerPosicionesUbicacion(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            const cantidadReal = Math.min(cantidad, total, this.maxSeleccion);
            
            if (cantidadReal === 0) return [];
            if (cantidadReal >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            // 🔥 Distribuir según ubicación
            switch (this.ubicacion) {
                case 'centro':
                    return this.obtenerPosicionesCentro(grid, cantidadReal);
                case 'esquinas':
                    return this.obtenerPosicionesEsquinas(grid, cantidadReal);
                case 'marco':
                    return this.obtenerPosicionesMarco(grid, cantidadReal);
                case 'aleatoria':
                default:
                    return this.obtenerPosicionesAleatorias(grid, cantidadReal);
            }
        }

        // =========================================================
        // 🎯 ALGORITMOS DE UBICACIÓN
        // =========================================================

        obtenerPosicionesAleatorias(grid, cantidad) {
            const total = this.getTotalCasillas(grid);
            const indices = Array.from({ length: total }, (_, i) => i);
            
            // Fisher-Yates shuffle
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            
            return indices.slice(0, cantidad);
        }

        obtenerPosicionesCentro(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            // Calcular centro
            const centroCol = (cols - 1) / 2;
            const centroRow = (rows - 1) / 2;
            
            // Crear lista de posiciones ordenadas por distancia al centro
            const posiciones = [];
            const distanciaMap = new Map();
            
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const idx = r * cols + c;
                    const dist = Math.sqrt(Math.pow(r - centroRow, 2) + Math.pow(c - centroCol, 2));
                    distanciaMap.set(idx, dist);
                    posiciones.push(idx);
                }
            }
            
            posiciones.sort((a, b) => distanciaMap.get(a) - distanciaMap.get(b));
            return posiciones.slice(0, cantidad);
        }

        obtenerPosicionesEsquinas(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            const usadas = new Set();
            
            // Definir esquinas (en orden de prioridad)
            const esquinas = [
                0,                          // Superior izquierda
                cols - 1,                   // Superior derecha
                (rows - 1) * cols,          // Inferior izquierda
                (rows - 1) * cols + cols - 1 // Inferior derecha
            ];
            
            // 1. Agregar esquinas
            for (const pos of esquinas) {
                if (pos < total && !usadas.has(pos) && posiciones.length < cantidad) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // 2. Si necesitamos más, expandir desde las esquinas
            if (posiciones.length < cantidad) {
                const vecinosPorEsquina = [];
                
                for (const pos of esquinas) {
                    if (pos >= total) continue;
                    const row = Math.floor(pos / cols);
                    const col = pos % cols;
                    
                    // Vecinos cercanos a la esquina
                    const offsets = [
                        [0, 1], [1, 0], [0, -1], [-1, 0],
                        [1, 1], [1, -1], [-1, 1], [-1, -1]
                    ];
                    
                    const vecinos = [];
                    for (const [dr, dc] of offsets) {
                        const nr = row + dr;
                        const nc = col + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                            const idx = nr * cols + nc;
                            if (!usadas.has(idx)) {
                                vecinos.push(idx);
                            }
                        }
                    }
                    vecinosPorEsquina.push(vecinos);
                }
                
                // Intercalar vecinos
                let agregados = 0;
                while (agregados < cantidad - posiciones.length) {
                    for (const vecinos of vecinosPorEsquina) {
                        if (agregados >= cantidad - posiciones.length) break;
                        for (const v of vecinos) {
                            if (!usadas.has(v) && agregados < cantidad - posiciones.length) {
                                posiciones.push(v);
                                usadas.add(v);
                                agregados++;
                            }
                        }
                    }
                    if (agregados === 0) break;
                }
            }
            
            return posiciones.slice(0, cantidad);
        }

        obtenerPosicionesMarco(grid, cantidad) {
            const cols = this.getColumnasGrid(grid);
            const rows = this.getFilasGrid(grid);
            const total = cols * rows;
            
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            
            const posiciones = [];
            const usadas = new Set();
            
            // 1. Borde superior (de izquierda a derecha)
            for (let c = 0; c < cols && posiciones.length < cantidad; c++) {
                const pos = c;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // 2. Borde inferior (de derecha a izquierda)
            for (let c = cols - 1; c >= 0 && posiciones.length < cantidad; c--) {
                const pos = (rows - 1) * cols + c;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // 3. Borde izquierdo (excepto esquinas)
            for (let r = 1; r < rows - 1 && posiciones.length < cantidad; r++) {
                const pos = r * cols;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // 4. Borde derecho (excepto esquinas)
            for (let r = rows - 2; r >= 1 && posiciones.length < cantidad; r--) {
                const pos = r * cols + cols - 1;
                if (!usadas.has(pos)) {
                    posiciones.push(pos);
                    usadas.add(pos);
                }
            }
            
            // 5. Si aún faltan, llenar con posiciones internas
            if (posiciones.length < cantidad) {
                const internas = [];
                for (let r = 1; r < rows - 1; r++) {
                    for (let c = 1; c < cols - 1; c++) {
                        const pos = r * cols + c;
                        if (!usadas.has(pos)) {
                            internas.push(pos);
                        }
                    }
                }
                
                // Ordenar por cercanía al borde
                internas.sort((a, b) => {
                    const ra = Math.floor(a / cols);
                    const ca = a % cols;
                    const rb = Math.floor(b / cols);
                    const cb = b % cols;
                    const distA = Math.min(ra, rows - 1 - ra, ca, cols - 1 - ca);
                    const distB = Math.min(rb, rows - 1 - rb, cb, cols - 1 - cb);
                    return distA - distB;
                });
                
                const restantes = cantidad - posiciones.length;
                posiciones.push(...internas.slice(0, restantes));
            }
            
            return posiciones.slice(0, cantidad);
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

        // =========================================================
        // MÉTODOS PÚBLICOS (para app.js)
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

        // ✅ NUEVO: Método público para recargar
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

    // Inicialización automática
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

    console.log('📦 Favoritas.js cargado (versión unificada con detección de barajas)');

})();
