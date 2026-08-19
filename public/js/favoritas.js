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
            
            var categoriasOrdenadas = Object.keys(this.categorias).sort(function(a, b) {
                return this.categorias[a].nombre.localeCompare(this.categorias[b].nombre);
            }.bind(this));
            
            this.categoriaActual = categoriasOrdenadas[0] || Object.keys(this.categorias)[0];
            
            this.bindEvents();
            this.renderCategorias(categoriasOrdenadas);
            this.cargarGridInicial();
            this.observarBarajas();
            
            console.log('📋 FavoritasManager iniciado');
        }

        cargarGridInicial() {
            var barajas = this.getBarajasDelDiseno();
            
            if (barajas.length > 0) {
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
                this.initialized = true;
            } else {
                this.initialized = false;
                
                var intentos = 0;
                var maxIntentos = 10;
                
                var esperarBarajas = setInterval(function() {
                    intentos++;
                    var barajasAhora = this.getBarajasDelDiseno();
                    
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
                        var grid = document.getElementById('j-favoritas-grid');
                        if (grid) {
                            grid.innerHTML = '<p style="color:#999;text-align:center;">Selecciona un diseño primero</p>';
                        }
                        console.log('⏳ Favoritas: No hay diseño seleccionado aún');
                    }
                }.bind(this), 500);
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
                        setTimeout(function() {
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
            var barajas = this.getBarajasDelDiseno();
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
            var btnAleatoria = document.getElementById('j-favoritas-aleatoria');
            if (btnAleatoria) {
                btnAleatoria.addEventListener('click', function() {
                    this.seleccionAleatoria();
                }.bind(this));
            }
        
            document.querySelectorAll('.j-ubicacion-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.j-ubicacion-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    this.ubicacion = btn.dataset.ubicacion;
                    JuguemosState.favoritasUbicacion = this.ubicacion;
                    this.actualizarPreviewCasillas();
                    
                    if (typeof llenarCasillasAutomatico === 'function') {
                        setTimeout(function() { llenarCasillasAutomatico(); }, 100);
                    }
                }.bind(this));
            }.bind(this));

            document.addEventListener('change', function(e) {
                if (e.target.classList.contains('j-ubicacion-checkbox')) {
                    this.esSeleccionAleatoria = false; 
                    this.actualizarPreviewCasillas();
                }   
            }.bind(this));
        }

        renderCategorias(categoriasOrdenadas) {
            var container = document.getElementById('j-favoritas-categorias');
            if (!container) return;
            
            container.innerHTML = '';
            
            categoriasOrdenadas.forEach(function(key) {
                var cat = this.categorias[key];
                if (!cat) return;
                
                var btn = document.createElement('button');
                btn.className = 'j-favoritas-categoria-btn' + (key === this.categoriaActual ? ' active' : '');
                btn.dataset.categoria = key;
                btn.textContent = cat.nombre;
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.j-favoritas-categoria-btn').forEach(function(b) { b.classList.remove('active'); });
                    btn.classList.add('active');
                    this.categoriaActual = key;
                    this.renderGrid();
                }.bind(this));
                container.appendChild(btn);
            }.bind(this));
        }

        generarDistribucionInteligente() {
            var grid = JuguemosState.grid || '4x4';
            var ubicacion = JuguemosState.favoritasUbicacion || 'aleatoria';
            var totalTablas = (JuguemosState.quantity || 1) * (JuguemosState.pages || 1);
            var favoritas = this.seleccionadas || [];
        
            if (favoritas.length === 0) {
                JuguemosState.favoritasEstructura = [];
                JuguemosState.favoritasDistribucion = [];
                return;
            }
        
            if (grid === 'pocitos3') {
                var estructura = [];
                for (var t = 0; t < totalTablas; t++) {
                    var favoritaTabla = t === 0 && favoritas.length > 0 ? [favoritas[0]] : [];
                    var posiciones = favoritaTabla.length > 0 ? [{ posicion: 1, favorita: favoritas[0] }] : [];
                    
                    estructura.push({
                        tablaIndex: t,
                        favoritas: favoritaTabla,
                        posiciones: posiciones,
                        cantidad: favoritaTabla.length
                    });
                }
                
                JuguemosState.favoritasEstructura = estructura;
                JuguemosState.favoritasDistribucion = estructura.map(function(t) { return t.favoritas; });
                
                if (typeof actualizarPreviewCasillas === 'function') {
                    var primeras = estructura[0]?.posiciones.map(function(p) { return p.favorita; }) || [];
                    actualizarPreviewCasillas(primeras);
                }
                
                return estructura;
            }
        
            var estructura = FavoritasLogic.generarEstructuraCompleta(
                favoritas,
                totalTablas,
                grid,
                ubicacion
            );
        
            JuguemosState.favoritasEstructura = estructura;
            JuguemosState.favoritasDistribucion = estructura.map(function(t) { return t.favoritas; });
            
            if (estructura.length > 0 && typeof actualizarPreviewCasillas === 'function') {
                var primeras = estructura[0]?.posiciones?.map(function(p) { return p.favorita; }) || [];
                actualizarPreviewCasillas(primeras);
            }
            
            return estructura;
        }


        actualizarPreviewCasillas() {
            console.log('🔄 actualizarPreviewCasillas - Favoritas:', this.seleccionadas.length);
            console.log('🔄 actualizarPreviewCasillas - Grid:', JuguemosState.grid);
            
            JuguemosState.favoritas = this.seleccionadas;
            JuguemosState.favoritasUbicacion = this.ubicacion;
            
            var grid = JuguemosState.grid || '4x4';
        
            // 🔥 CRUZADAS
            if (grid === 'cruzadas') {
                this.actualizarPreviewCruzadas();
                return;
            }
            
            var container = document.getElementById('j-casilla-preview-grid');
            if (!container) return;
            
            var total = this.getTotalCasillas(grid);
            container.dataset.grid = grid;
            
            // Configurar grid
            if (grid === 'pocitos4') {
                container.style.gridTemplateColumns = 'repeat(2, 1fr)';
                container.style.gridTemplateRows = 'repeat(2, 1fr)';
            } else {
                container.style.gridTemplateColumns = '';
                container.style.gridTemplateRows = '';
            }
            
            // Si no hay favoritas, mostrar vacío
            if (this.seleccionadas.length === 0) {
                container.innerHTML = Array(total)
                    .fill('<div class="cell empty"></div>')
                    .join('');
                return;
            }
            
            // Obtener ubicaciones seleccionadas
            const ubicacionesSeleccionadas = [];
            
            if (this.esSeleccionAleatoria) {
                ubicacionesSeleccionadas.push('centro', 'marco', 'esquinas', 'aleatoria');
            } else {
                document.querySelectorAll('.j-ubicacion-checkbox:checked').forEach(cb => {
                    ubicacionesSeleccionadas.push(cb.dataset.ubicacion);
                });
                if (ubicacionesSeleccionadas.length === 0) {
                    ubicacionesSeleccionadas.push('aleatoria');
                }
            }
        
            // =========================================================
            // 🔥🔥🔥 POCITOS 4 - ROTACIÓN AUTOMÁTICA 🔥🔥🔥
            // =========================================================
            
            let distribucion = [];
            let favoritasParaMostrar = this.seleccionadas;
            
            if (grid === 'pocitos4') {
                
                // 🔥 CONTADOR DE TABLA
                if (typeof this._contadorTabla === 'undefined') {
                    this._contadorTabla = 0;
                }
                
                const totalFavoritas = this.seleccionadas.length;
                const maxPorTabla = 2;
                const totalTablasNecesarias = Math.ceil(totalFavoritas / maxPorTabla);
                
                if (this._contadorTabla >= totalTablasNecesarias) {
                    this._contadorTabla = 0;
                }
                
                const inicio = this._contadorTabla * maxPorTabla;
                const fin = Math.min(inicio + maxPorTabla, totalFavoritas);
                favoritasParaMostrar = this.seleccionadas.slice(inicio, fin);
                
                this._contadorTabla++;
                
                distribucion = FavoritasDistribucion.distribuir(
                    favoritasParaMostrar,
                    1,
                    grid,
                    ubicacionesSeleccionadas,
                    []
                );
                
                // 🔥 LIMPIAR TIMER ANTERIOR
                if (this._timerRotacion) {
                    clearTimeout(this._timerRotacion);
                }
                
                // 🔥 PROGRAMAR PRÓXIMA ROTACIÓN (2 segundos)
                if (totalTablasNecesarias > 1) {
                    this._timerRotacion = setTimeout(() => {
                        this.actualizarPreviewCasillas();
                    }, 2000);
                }
                
            } else {
                distribucion = FavoritasDistribucion.distribuir(
                    this.seleccionadas,
                    1,
                    grid,
                    ubicacionesSeleccionadas,
                    this.asignacionAnterior || []
                );
                this.asignacionAnterior = distribucion;
            }
        
            // =========================================================
            // GENERAR HTML
            // =========================================================
            
            let html = '';
            for (let i = 0; i < total; i++) {
                const item = distribucion.find(d => d.posicion === i);
                if (item) {
                    html += `
                        <div class="cell favorita" data-index="${i}" data-ubicacion="${item.ubicacion}">
                            <img src="${item.favorita.imagen || ''}" alt="${item.favorita.nombre || ''}" loading="lazy">
                            <span class="j-favorita-badge">⭐</span>
                        </div>
                    `;
                } else {
                    html += `<div class="cell empty" data-index="${i}"></div>`;
                }
            }
            container.innerHTML = html;
            
            // ❌ ELIMINAR INDICADOR
            const indicator = container.parentElement?.querySelector('.j-tabla-indicator');
            if (indicator) indicator.remove();
        }

/**
 * VISTA PREVIA DE CASILLAS - CRUZADAS (8 celdas visibles)
 */
actualizarPreviewCruzadas() {
    console.log('🔄 actualizarPreviewCruzadas - Favoritas:', this.seleccionadas.length);
    
    JuguemosState.favoritas = this.seleccionadas;
    
    var container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    
    container.dataset.grid = 'cruzadas';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.gridTemplateRows = 'repeat(4, 1fr)';
    
    var casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
    var html = '';
    
    for (var i = 0; i < 16; i++) {
        var row = Math.floor(i / 4) + 1;
        var col = (i % 4) + 1;
        var esVisible = casillasVisibles.includes(i);
        
        if (esVisible) {
            var casilla = null;
            var esFavorita = false;
            
            for (var f = 0; f < this.seleccionadas.length; f++) {
                var fav = this.seleccionadas[f];
                if (fav && parseInt(fav.numero) === i + 1) {
                    casilla = fav;
                    esFavorita = true;
                    break;
                }
            }
            
            if (casilla) {
                html += `
                    <div class="cell visible ${esFavorita ? 'favorita' : ''}" 
                         style="grid-row: ${row}; grid-column: ${col};">
                        <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        ${esFavorita ? '<span class="j-favorita-badge"></span>' : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                    </div>
                `;
            }
        } else {
            html += `
                <div class="cell invisible" style="grid-row: ${row}; grid-column: ${col};"></div>
            `;
        }
    }
    
    container.innerHTML = html;
}

/**
 * VISTA PREVIA DE CASILLAS - CRUZADAS (8 celdas visibles)
 */
actualizarPreviewCruzadas() {
    console.log('🔄 actualizarPreviewCruzadas - Favoritas:', this.seleccionadas.length);
    
    JuguemosState.favoritas = this.seleccionadas;
    
    var container = document.getElementById('j-casilla-preview-grid');
    if (!container) return;
    
    container.dataset.grid = 'cruzadas';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.gridTemplateRows = 'repeat(4, 1fr)';
    
    var casillasVisibles = [0, 3, 5, 6, 9, 10, 12, 15];
    var html = '';
    
    for (var i = 0; i < 16; i++) {
        var row = Math.floor(i / 4) + 1;
        var col = (i % 4) + 1;
        var esVisible = casillasVisibles.includes(i);
        
        if (esVisible) {
            var casilla = null;
            var esFavorita = false;
            
            for (var f = 0; f < this.seleccionadas.length; f++) {
                var fav = this.seleccionadas[f];
                if (fav && parseInt(fav.numero) === i + 1) {
                    casilla = fav;
                    esFavorita = true;
                    break;
                }
            }
            
            if (casilla) {
                html += `
                    <div class="cell visible ${esFavorita ? 'favorita' : ''}" 
                         style="grid-row: ${row}; grid-column: ${col};">
                        <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        ${esFavorita ? '<span class="j-favorita-badge"></span>' : ''}
                    </div>
                `;
            } else {
                html += `
                    <div class="cell visible" style="grid-row: ${row}; grid-column: ${col};">
                    </div>
                `;
            }
        } else {
            html += `
                <div class="cell invisible" style="grid-row: ${row}; grid-column: ${col};"></div>
            `;
        }
    }
    
    container.innerHTML = html;
}
        
        mostrarPreviewConEstructura(estructura) {
            var container = document.getElementById('j-casilla-preview-grid');
            if (!container) return;
            
            var grid = JuguemosState.grid || '4x4';
            var total = FavoritasLogic.getGridConfig(grid).total;
            
            if (grid === 'pocitos3') {
                var html = '';
                for (var i = 0; i < total; i++) {
                    var esFavorita = (i === 1) && this.seleccionadas.length > 0;
                    var casilla = esFavorita ? this.seleccionadas[0] : null;
                    
                    if (esFavorita && casilla) {
                        html += `
                            <div class="cell favorita" data-index="${i}">
                                <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                            </div>
                        `;
                    } else {
                        html += '<div class="cell empty" data-index="' + i + '"></div>';
                    }
                }
                container.innerHTML = html;
                return;
            }
            
            if (grid === 'cruzadas') {
                this.actualizarPreviewCruzadas();
                return;
            }
            
            var primeraTabla = estructura[0] || { posiciones: [] };
            var posiciones = primeraTabla.posiciones || [];
            
            var casillas = Array(total).fill(null);
            posiciones.forEach(function(item) {
                if (item.posicion < total) {
                    casillas[item.posicion] = item.favorita;
                }
            });
            
            var html = '';
            for (var i = 0; i < total; i++) {
                var casilla = casillas[i];
                var esFavorita = casilla !== null && casilla !== undefined;
                
                if (esFavorita) {
                    html += `
                        <div class="cell favorita" data-index="${i}">
                            <img src="${casilla.imagen || ''}" alt="${casilla.nombre || ''}" loading="lazy">
                        </div>
                    `;
                } else {
                    html += '<div class="cell empty" data-index="' + i + '"></div>';
                }
            }
            
            container.innerHTML = html;
        }

        // =========================================================
        // RENDERIZADO DEL GRID DE SELECCIÓN
        // =========================================================

        renderGrid() {
            var grid = document.getElementById('j-favoritas-grid');
            if (!grid) return;
            
            grid.innerHTML = '';
            
            var cat = this.categorias[this.categoriaActual];
            if (!cat || !cat.numeros || cat.numeros.length === 0) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">No hay barajas en esta categoría</p>';
                return;
            }
            
            var barajasDisponibles = this.getBarajasDelDiseno();
            
            if (barajasDisponibles.length === 0) {
                grid.innerHTML = `
                    <p style="color:#999;text-align:center;padding:20px;">
                        Selecciona un diseño primero<br>
                        <span style="font-size:12px;color:#ccc;">Las barajas aparecerán automáticamente</span>
                    </p>
                `;
                return;
            }
            
            var encontradas = 0;
            cat.numeros.forEach(function(numero) {
                var baraja = barajasDisponibles.find(function(b) { return parseInt(b.numero) === numero; });
                if (!baraja) return;
                
                encontradas++;
                var isSelected = this.seleccionadas.some(function(s) { return parseInt(s.numero) === numero; });
                var isPopular = this.populares.includes(numero);
                
                var item = document.createElement('div');
                item.className = 'j-favoritas-item' + (isSelected ? ' selected' : '');
                
                var html = `
                    <img src="${baraja.imagen}" alt="${baraja.nombre}" loading="lazy">
                    ${isSelected ? '<span class="j-heart-center"></span>' : ''}
                    <span class="j-favoritas-nombre">${baraja.nombre}</span>
                    <span class="j-check-circle">✓</span>
                `;
                
                if (isPopular) {
                    html += '<span class="j-popular-badge"><span class="heart"></span> Popular</span>';
                }
                
                item.innerHTML = html;
                
                item.addEventListener('click', function() {
                    this.toggleSeleccion(baraja);
                }.bind(this));
                
                grid.appendChild(item);
            }.bind(this));
            
            if (encontradas === 0) {
                grid.innerHTML = `
                    <p class="j-favoritas-grid-wrapper">
                        <span class="j-favoritas-mensaje">Prueba con otra categoría</span>
                    </p>
                `;
            }
        }
        toggleSeleccion(baraja) {
            this.esSeleccionAleatoria = false; 
            var numero = parseInt(baraja.numero);
            var index = this.seleccionadas.findIndex(function(s) { return parseInt(s.numero) === numero; });
        
            if (JuguemosState.grid === 'pocitos4') {
                // 🔥 NUEVO: Resetear tabla actual al cambiar selección
                this.tablaActual = 0;
                this.asignacionAnterior = [];
                
                if (index !== -1) {
                    this.seleccionadas.splice(index, 1);
                } else {
                    // 🔥 NUEVO: Permitir más de 2 (se distribuirán en tablas)
                    if (this.seleccionadas.length >= this.maxSeleccion) {
                        alert('Solo puedes seleccionar ' + this.maxSeleccion + ' favoritas.');
                        return;
                    }
                    this.seleccionadas.push(baraja);
                }
        
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();  // ← Ahora muestra SOLO 2 por tabla
                
                if (typeof llenarCasillasAutomatico === 'function') {
                    setTimeout(function() { llenarCasillasAutomatico(); }, 100);
                }
                return;
            }

            if (JuguemosState.grid === 'pocitos3') {
                this.asignacionAnterior = []; 
                if (index !== -1) {
                    this.seleccionadas.splice(index, 1);
                } else {
                    if (this.seleccionadas.length === 1) {
                        this.seleccionadas = [];
                    }
                    this.seleccionadas.push(baraja);
                }
        
                this.renderGrid();
                this.updateContador();
                this.updateProgress();
                this.actualizarPreviewCasillas();
        
                if (typeof llenarCasillasAutomatico === 'function') {
                    setTimeout(function() { llenarCasillasAutomatico(); }, 100);
                }
                return;
            }
        
            if (index !== -1) {
                // Se está quitando una favorita: sacarla también de la memoria de posiciones
                this.seleccionadas.splice(index, 1);
                if (this.asignacionAnterior && this.asignacionAnterior.length > 0) {
                    this.asignacionAnterior = this.asignacionAnterior.filter(function(item) {
                        return parseInt(item.favorita.numero) !== numero;
                    });
                }
            } else {
                if (this.seleccionadas.length >= this.maxSeleccion) {
                    alert('Solo puedes seleccionar ' + this.maxSeleccion + ' favoritas.');
                    return;
                }
                this.seleccionadas.push(baraja);
                // 👆 No tocamos asignacionAnterior: lo ya colocado se mantiene,
                // distribuir() solo va a ubicar la nueva favorita en un hueco libre
            }
        
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
        
            if (JuguemosState.grid === 'cruzadas') {
                this.actualizarPreviewCruzadas();
            } else {
                this.actualizarPreviewCasillas();
            }
        
            if (typeof llenarCasillasAutomatico === 'function') {
                setTimeout(function() { llenarCasillasAutomatico(); }, 100);
            }
        }

        seleccionAleatoria() {
            var barajas = this.getBarajasDelDiseno();
            if (barajas.length === 0) {
                alert('Primero selecciona un diseño.');
                return;
            }
            
            var limite = this.maxSeleccion;  // 12 (por defecto)
            
            if (JuguemosState.grid === 'pocitos3') {
                limite = 1;
            }
            
            if (JuguemosState.grid === 'pocitos4') {
                this.tablaActual = 0;
            }
            
            var mezcladas = [...barajas];
            for (var i = mezcladas.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = mezcladas[i];
                mezcladas[i] = mezcladas[j];
                mezcladas[j] = temp;
            }
            
            this.seleccionadas = mezcladas.slice(0, limite);
            this.asignacionAnterior = [];
            this.esSeleccionAleatoria = true;
            
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarPreviewCasillas();  
            
            if (typeof llenarCasillasAutomatico === 'function') {
                setTimeout(function() { llenarCasillasAutomatico(); }, 100);
            }
        }

        updateContador() {
            var total = this.seleccionadas.length;
            
            var counter = document.getElementById('j-favoritas-seleccionadas');
            var count = document.getElementById('j-favoritas-count');
            var circle = document.getElementById('j-favoritas-counter-circle');
            
            if (counter) counter.textContent = total;
            if (count) count.textContent = total;
            if (circle) {
                circle.classList.toggle('complete', total === this.maxSeleccion);
            }
        }

        updateProgress() {
            var total = this.seleccionadas.length;
            
            var range = document.getElementById('j-favoritas-progress-range');
            var number = document.getElementById('j-favoritas-progress-number');
            
            if (range) {
                range.value = total;
                var percentage = (total / this.maxSeleccion) * 100;
                range.style.background = 'linear-gradient(to right, #FA299C 0%, #FA299C ' + percentage + '%, #E5E5E5 ' + percentage + '%, #E5E5E5 100%)';
            }
            if (number) {
                number.textContent = total;
            }
        }

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

    var instance = null;

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

    document.addEventListener('DOMContentLoaded', function() {
        if (typeof JuguemosState !== 'undefined') {
            window.FavoritasManagerInstance = window.FavoritasManager.init();
        } else {
            var checkState = setInterval(function() {
                if (typeof JuguemosState !== 'undefined') {
                    clearInterval(checkState);
                    window.FavoritasManagerInstance = window.FavoritasManager.init();
                }
            }, 100);
        }
    });
})();
