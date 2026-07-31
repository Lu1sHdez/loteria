(function() {
    'use strict';

    class FavoritasManager {
        constructor() {
            this.maxSeleccion = 12;
            this.seleccionadas = [];
            this.categoriaActual = null;
            this.ubicacion = 'aleatoria';
            this.barajasData = [];
            
            // ⭐ Barajas populares (por número)
            this.populares = [3, 6, 17, 18, 4, 7, 19, 1];
            
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
            this.init();
        }

        init() {
            if (!this.container) {
                console.warn('⚠️ Contenedor j-favoritas-option no encontrado');
                return;
            }
            
            const categoriasOrdenadas = Object.keys(this.categorias).sort((a, b) => {
                return this.categorias[a].nombre.localeCompare(this.categorias[b].nombre);
            });
            
            if (categoriasOrdenadas.length === 0) {
                console.error('❌ No hay categorías definidas');
                return;
            }
            
            this.categoriaActual = categoriasOrdenadas[0];
            
            this.bindEvents();
            this.renderCategorias(categoriasOrdenadas);
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            
            console.log('📋 FavoritasManager iniciado');
        }

        bindEvents() {
            const btnAleatoria = document.getElementById('j-favoritas-aleatoria');
            if (btnAleatoria) {
                btnAleatoria.addEventListener('click', () => {
                    this.seleccionAleatoria();
                });
            }
        
            // 🔥 ACTUALIZAR UBICACIÓN Y REGENERAR
            document.querySelectorAll('.j-ubicacion-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.j-ubicacion-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.ubicacion = btn.dataset.ubicacion;
                    
                    // 🔥 FORZAR REGENERACIÓN CON NUEVA UBICACIÓN
                    this.actualizarCasillasFavoritas();
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

        renderGrid() {
            const grid = document.getElementById('j-favoritas-grid');
            if (!grid) {
                console.warn('⚠️ Grid j-favoritas-grid no encontrado');
                return;
            }
            
            grid.innerHTML = '';
            
            const cat = this.categorias[this.categoriaActual];
            if (!cat) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">Categoría no disponible</p>';
                return;
            }
            
            if (!cat.numeros || cat.numeros.length === 0) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">No hay barajas en esta categoría</p>';
                return;
            }
            
            const barajasDisponibles = this.getBarajasDelDiseno();
            
            if (barajasDisponibles.length === 0) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">Selecciona un diseño primero</p>';
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
                `;
                
                // Check circular en esquina superior derecha
                html += `<span class="j-check-circle">✓</span>`;
                
                // Badge Popular debajo de la baraja
                if (isPopular) {
                    html += `
                        <span class="j-popular-badge">
                            <span class="heart">❤️</span> Popular
                        </span>
                    `;
                }
                
                item.innerHTML = html;
                
                item.addEventListener('click', () => {
                    this.toggleSeleccion(baraja);
                });
                
                grid.appendChild(item);
            });
            
            if (encontradas === 0) {
                grid.innerHTML = '<p style="color:#999;text-align:center;">No hay barajas en esta categoría</p>';
            }
        }

        getBarajasDelDiseno() {
            if (JuguemosState.barajas && JuguemosState.barajas.length > 0) {
                return JuguemosState.barajas;
            }
            return [];
        }

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
            
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarCasillasFavoritas();
        }

        updateContador() {
            const counter = document.getElementById('j-favoritas-seleccionadas');
            const count = document.getElementById('j-favoritas-count');
            const circle = document.getElementById('j-favoritas-counter-circle');
            
            const total = this.seleccionadas.length;
            
            if (counter) counter.textContent = total;
            if (count) count.textContent = total;
            
            if (circle) {
                circle.classList.toggle('complete', total === this.maxSeleccion);
            }
        }

        updateProgress() {
            const range = document.getElementById('j-favoritas-progress-range');
            const number = document.getElementById('j-favoritas-progress-number');
            
            const total = this.seleccionadas.length;
            
            if (range) {
                range.value = total;
                const percentage = (total / this.maxSeleccion) * 100;
                range.style.background = `linear-gradient(to right, #FA299C 0%, #FA299C ${percentage}%, #E5E5E5 ${percentage}%, #E5E5E5 100%)`;
            }
            
            if (number) {
                number.textContent = total;
            }
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
            this.renderGrid();
            this.updateContador();
            this.updateProgress();
            this.actualizarCasillasFavoritas();
        }

        actualizarCasillasFavoritas() {
            JuguemosState.favoritas = this.seleccionadas;
            JuguemosState.favoritasUbicacion = this.ubicacion;
            
            console.log('📍 Ubicación actualizada:', this.ubicacion);
            console.log('🃏 Favoritas:', this.seleccionadas.length);
            
            // 🔥 Forzar regeneración inmediata
            if (typeof llenarCasillasAutomatico === 'function') {
                JuguemosState.todasLasTablas = [];
                // Limpiar vista previa primero
                if (typeof limpiarCasillas === 'function') {
                    limpiarCasillas();
                }
                // Luego regenerar
                setTimeout(() => {
                    llenarCasillasAutomatico();
                    // Actualizar vista previa del PDF
                    if (typeof PrintPaper !== 'undefined') {
                        setTimeout(() => PrintPaper.refresh(), 300);
                    }
                }, 100);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.FavoritasManagerInstance = new FavoritasManager();
    });

})();
