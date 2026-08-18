/**
 * =====================================================
 * FAVORITAS DISTRIBUCIÓN - Lógica avanzada de ubicaciones múltiples
 * =====================================================
 */

(function() {
    'use strict';

    class FavoritasDistribucion {

        // =========================================================
        // CONFIGURACIÓN DE POSICIONES POR GRID Y UBICACIÓN
        // =========================================================

        static getPosicionesPorUbicacion(grid, ubicacion) {
            const mapas = {
                '4x4': {
                    'centro': [5, 6, 9, 10],
                    'esquinas': [0, 3, 12, 15],
                    'marco': [1, 2, 4, 7, 8, 11, 13, 14],
                    'aleatoria': [] // Se genera dinámicamente
                },
                '5x5': {
                    'centro': [12],
                    'esquinas': [0, 4, 20, 24],
                    'marco': [1, 2, 3, 5, 9, 10, 14, 15, 19, 21, 22, 23],
                    'aleatoria': []
                },
                'pocitos4': {
                    'centro': [0, 1, 2, 3],
                    'esquinas': [0, 3],
                    'marco': [0, 1, 2, 3],
                    'aleatoria': []
                },
                'pocitos3': {
                    'centro': [1],
                    'esquinas': [0, 2],
                    'marco': [0, 1, 2],
                    'aleatoria': []
                },
                'cruzadas': {
                    'centro': [3, 4],
                    'esquinas': [0, 7],
                    'marco': [0, 1, 2, 3, 4, 5, 6, 7],
                    'aleatoria': []
                }
            };

            const gridMap = mapas[grid] || mapas['4x4'];
            return gridMap[ubicacion] || [];
        }

        static getTotalCasillas(grid) {
            const configs = {
                '4x4': 16,
                '5x5': 25,
                'pocitos4': 4,
                'pocitos3': 3,
                'cruzadas': 8
            };
            return configs[grid] || 16;
        }

        static getPosicionesAleatorias(grid, cantidad, ocupadas) {
            const total = this.getTotalCasillas(grid);
            const disponibles = [];
            for (let i = 0; i < total; i++) {
                if (!ocupadas.includes(i)) {
                    disponibles.push(i);
                }
            }
            // Mezclar disponibles
            for (let i = disponibles.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [disponibles[i], disponibles[j]] = [disponibles[j], disponibles[i]];
            }
            return disponibles.slice(0, cantidad);
        }

        // =========================================================
        // LÓGICA PRINCIPAL DE DISTRIBUCIÓN
        // =========================================================

        static distribuir(favoritas, totalTablas, grid, ubicacionesSeleccionadas) {
            if (!favoritas || favoritas.length === 0) return [];
            
            const totalFavoritas = favoritas.length;
            const posicionesOcupadas = [];
            const asignacion = [];

            // 🔥 PRIORIDAD: Centro > Marco > Esquinas > Aleatoria
            const ordenPrioridad = ['centro', 'marco', 'esquinas', 'aleatoria'];
            const ubicaciones = ubicacionesSeleccionadas || ['aleatoria'];

            // Si solo hay 1 ubicación, distribuir todas ahí
            if (ubicaciones.length === 1) {
                return this.distribuirUnaUbicacion(favoritas, grid, ubicaciones[0]);
            }

            // Si hay múltiples ubicaciones
            let favoritasRestantes = [...favoritas];
            
            // 1. Primero asignar a las ubicaciones fijas (centro, marco, esquinas)
            ordenPrioridad.forEach(ubicacion => {
                if (!ubicaciones.includes(ubicacion)) return;
                if (favoritasRestantes.length === 0) return;

                const posicionesFijas = this.getPosicionesPorUbicacion(grid, ubicacion);
                if (posicionesFijas.length === 0) return;

                // Tomar las favoritas que caben en esta ubicación
                const cantidad = Math.min(posicionesFijas.length, favoritasRestantes.length);
                const favoritasAsignadas = favoritasRestantes.splice(0, cantidad);

                // Asignar a las posiciones fijas
                for (let i = 0; i < favoritasAsignadas.length; i++) {
                    const pos = posicionesFijas[i];
                    posicionesOcupadas.push(pos);
                    asignacion.push({
                        posicion: pos,
                        favorita: favoritasAsignadas[i],
                        ubicacion: ubicacion
                    });
                }
            });

            // 2. Si quedan favoritas sin asignar, ponerlas en aleatorio
            if (favoritasRestantes.length > 0) {
                const aleatorias = this.getPosicionesAleatorias(grid, favoritasRestantes.length, posicionesOcupadas);
                for (let i = 0; i < favoritasRestantes.length; i++) {
                    const pos = aleatorias[i];
                    if (pos !== undefined) {
                        posicionesOcupadas.push(pos);
                        asignacion.push({
                            posicion: pos,
                            favorita: favoritasRestantes[i],
                            ubicacion: 'aleatoria'
                        });
                    }
                }
            }

            // 3. Ordenar por posición para mostrarlo bonito
            asignacion.sort((a, b) => a.posicion - b.posicion);
            return asignacion;
        }

        // Distribución para una sola ubicación
        static distribuirUnaUbicacion(favoritas, grid, ubicacion) {
            const total = this.getTotalCasillas(grid);
            const posicionesFijas = this.getPosicionesPorUbicacion(grid, ubicacion);
            
            const resultado = [];
            const posicionesOcupadas = [];

            // Si la ubicación tiene posiciones fijas
            if (posicionesFijas.length > 0) {
                for (let i = 0; i < Math.min(favoritas.length, posicionesFijas.length); i++) {
                    const pos = posicionesFijas[i];
                    posicionesOcupadas.push(pos);
                    resultado.push({
                        posicion: pos,
                        favorita: favoritas[i],
                        ubicacion: ubicacion
                    });
                }

                // Si hay más favoritas que posiciones fijas, rellenar con aleatorio
                if (favoritas.length > posicionesFijas.length) {
                    const restantes = favoritas.slice(posicionesFijas.length);
                    const aleatorias = this.getPosicionesAleatorias(grid, restantes.length, posicionesOcupadas);
                    for (let i = 0; i < restantes.length; i++) {
                        const pos = aleatorias[i];
                        if (pos !== undefined) {
                            posicionesOcupadas.push(pos);
                            resultado.push({
                                posicion: pos,
                                favorita: restantes[i],
                                ubicacion: 'aleatoria'
                            });
                        }
                    }
                }
            } else {
                // Si es aleatoria pura, distribuir todas aleatoriamente
                const aleatorias = this.getPosicionesAleatorias(grid, favoritas.length, []);
                for (let i = 0; i < favoritas.length; i++) {
                    resultado.push({
                        posicion: aleatorias[i],
                        favorita: favoritas[i],
                        ubicacion: 'aleatoria'
                    });
                }
            }

            resultado.sort((a, b) => a.posicion - b.posicion);
            return resultado;
        }

        // =========================================================
        // GENERAR HTML PARA VISTA PREVIA DE CASILLAS
        // =========================================================

        static generarHTML(grid, distribucion, totalFavoritas) {
            const total = this.getTotalCasillas(grid);
            let html = '';
            
            for (let i = 0; i < total; i++) {
                const item = distribucion.find(d => d.posicion === i);
                if (item) {
                    html += `
                        <div class="cell favorita" data-index="${i}" data-ubicacion="${item.ubicacion}">
                            <img src="${item.favorita.imagen}" alt="${item.favorita.nombre}" loading="lazy">
                            <span class="j-favorita-badge">⭐</span>
                        </div>
                    `;
                } else {
                    html += `<div class="cell empty" data-index="${i}"></div>`;
                }
            }
            return html;
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    window.FavoritasDistribucion = FavoritasDistribucion;

    console.log('📦 FavoritasDistribucion.js cargado correctamente');

})();
