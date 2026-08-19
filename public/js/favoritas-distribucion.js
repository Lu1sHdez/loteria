/**
 * =====================================================
 * FAVORITAS DISTRIBUCIÓN - Lógica avanzada de ubicaciones múltiples (ACUMULATIVA)
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
        // LÓGICA PRINCIPAL DE DISTRIBUCIÓN (ACUMULATIVA)
        // =========================================================

        static distribuir(favoritas, totalTablas, grid, ubicacionesSeleccionadas, asignacionAnterior = []) {
            if (!favoritas || favoritas.length === 0) return [];
            
            const totalFavoritas = favoritas.length;
            const posicionesOcupadas = [];
            const asignacion = [];

            // 🔥 PASO 1: RESTAURAR LA ASIGNACIÓN ANTERIOR (si existe)
            // Si ya hay una asignación previa, la usamos como base
            if (asignacionAnterior && asignacionAnterior.length > 0) {
                // Restaurar posiciones ocupadas y barajas ya asignadas
                asignacionAnterior.forEach(item => {
                    posicionesOcupadas.push(item.posicion);
                    asignacion.push(item);
                });
            }

            // 🔥 PASO 2: IDENTIFICAR BARAJAS QUE FALTAN POR ASIGNAR
            // Buscar las favoritas que aún no han sido asignadas
            const barajasYaAsignadas = asignacion.map(item => item.favorita.numero);
            const favoritasPendientes = favoritas.filter(f => !barajasYaAsignadas.includes(f.numero));

            // Si no hay pendientes, retornar la asignación actual
            if (favoritasPendientes.length === 0) {
                return asignacion;
            }

            // 🔥 PRIORIDAD: Centro > Marco > Esquinas > Aleatoria
            const ordenPrioridad = ['centro', 'marco', 'esquinas', 'aleatoria'];
            const ubicaciones = ubicacionesSeleccionadas || ['aleatoria'];

            let favoritasRestantes = [...favoritasPendientes];

            // 🔥 PASO 3: ASIGNAR LAS PENDIENTES A LAS NUEVAS UBICACIONES
            ordenPrioridad.forEach(ubicacion => {
                if (!ubicaciones.includes(ubicacion)) return;
                if (favoritasRestantes.length === 0) return;

                const posicionesFijas = this.getPosicionesPorUbicacion(grid, ubicacion);
                if (posicionesFijas.length === 0) return;

                // 🔥 FILTRAR POSICIONES QUE YA ESTÁN OCUPADAS
                const posicionesLibres = posicionesFijas.filter(pos => !posicionesOcupadas.includes(pos));

                if (posicionesLibres.length === 0) return;

                const cantidad = Math.min(posicionesLibres.length, favoritasRestantes.length);
                const favoritasAsignadas = favoritasRestantes.splice(0, cantidad);

                for (let i = 0; i < favoritasAsignadas.length; i++) {
                    const pos = posicionesLibres[i];
                    posicionesOcupadas.push(pos);
                    asignacion.push({
                        posicion: pos,
                        favorita: favoritasAsignadas[i],
                        ubicacion: ubicacion
                    });
                }
            });

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
            asignacion.sort((a, b) => a.posicion - b.posicion);
            return asignacion;
        }

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
    window.FavoritasDistribucion = FavoritasDistribucion;
})();
