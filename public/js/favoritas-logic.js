/**
 * =====================================================
 * FAVORITAS LOGIC - Módulo de distribución inteligente
 * =====================================================
 * 
 * Lógica de distribución de favoritas según:
 * - Grid (4x4, 5x5, pocitos, cruzadas)
 * - Ubicación (centro, esquinas, marco, aleatoria)
 * - Número de tablas
 * - Número de favoritas seleccionadas
 * =====================================================
 */

(function() {
    'use strict';

    class FavoritasLogic {
        
        // =========================================================
        // CONFIGURACIÓN DE GRIDS (usa GridPosiciones)
        // =========================================================
        
        static getGridConfig(grid) {
            if (typeof GridPosiciones !== 'undefined') {
                return GridPosiciones.getGridConfig(grid);
            }
            const configs = {
                '4x4': { cols: 4, rows: 4, total: 16 },
                '5x5': { cols: 5, rows: 5, total: 25 },
                'pocitos4': { cols: 2, rows: 2, total: 4 },
                'pocitos3': { cols: 2, rows: 2, total: 3 },
                'cruzadas': { cols: 4, rows: 4, total: 8 }
            };
            return configs[grid] || configs['4x4'];
        }

        // =========================================================
        // OBTENER POSICIONES (usa GridPosiciones)
        // =========================================================
        
        static getPosicionesPorUbicacion(ubicacion, grid, cantidad) {
            if (typeof GridPosiciones !== 'undefined') {
                return GridPosiciones.getPositions(ubicacion, grid, cantidad);
            }
            // Fallback
            const config = this.getGridConfig(grid);
            const { total } = config;
            if (cantidad >= total) {
                return Array.from({ length: total }, (_, i) => i);
            }
            const indices = Array.from({ length: total }, (_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            return indices.slice(0, cantidad);
        }

        // =========================================================
        // LÓGICA PRINCIPAL DE DISTRIBUCIÓN
        // =========================================================

        static distribuirFavoritas(favoritas, totalTablas, grid, ubicacion) {
            if (!favoritas || favoritas.length === 0 || totalTablas === 0) {
                return [];
            }

            const maxPorTabla = this.getMaxPorUbicacion(ubicacion, grid);
            const totalFavoritas = favoritas.length;

            if (totalTablas === 1) {
                return [favoritas.slice(0, maxPorTabla)];
            }

            const distribucion = this.calcularDistribucion(totalFavoritas, totalTablas, maxPorTabla);
            
            const resultado = [];
            let index = 0;
            
            for (let i = 0; i < totalTablas; i++) {
                const cantidad = distribucion[i] || 0;
                resultado.push(favoritas.slice(index, index + cantidad));
                index += cantidad;
            }

            return resultado;
        }

        static calcularDistribucion(totalFavoritas, totalTablas, maxPorTabla) {
            const maxTotal = totalTablas * maxPorTabla;
            const cantidadReal = Math.min(totalFavoritas, maxTotal);
            
            const base = Math.floor(cantidadReal / totalTablas);
            const resto = cantidadReal % totalTablas;
            
            const distribucion = [];
            for (let i = 0; i < totalTablas; i++) {
                let cantidad = base + (i < resto ? 1 : 0);
                cantidad = Math.min(cantidad, maxPorTabla);
                distribucion.push(cantidad);
            }
            
            let asignadas = distribucion.reduce((a, b) => a + b, 0);
            let sobrantes = cantidadReal - asignadas;
            let idx = 0;
            
            while (sobrantes > 0 && idx < totalTablas * 2) {
                for (let i = 0; i < totalTablas && sobrantes > 0; i++) {
                    if (distribucion[i] < maxPorTabla) {
                        distribucion[i]++;
                        sobrantes--;
                    }
                }
                idx++;
            }
            
            return distribucion;
        }

        static getMaxPorUbicacion(ubicacion, grid) {
            const total = this.getGridConfig(grid).total;
    
            // 🔥 PARA POCITOS 3 - SOLO PERMITE 1 FAVORITA (en casilla 2)
            if (grid === 'pocitos3') {
                return 1;
            }
    
            if (typeof GridPosiciones !== 'undefined') {
                const todas = GridPosiciones.getPositions(ubicacion, grid, total);
                return Math.min(todas.length, 12);
            }
    
            switch(ubicacion) {
                case 'centro':
                    if (grid === '5x5') return 1;
                    if (grid === '4x4') return 4;
                    if (grid === 'cruzadas') return 2;
                    return Math.min(4, total);
                case 'esquinas':
                    return Math.min(4, total);
                case 'marco':
                    return Math.min(12, total);
                default:
                    return Math.min(12, total);
            }
        }

        static getPosicionesParaTabla(favoritasTabla, grid, ubicacion) {
            if (!favoritasTabla || favoritasTabla.length === 0) {
                return [];
            }
            
            const total = this.getGridConfig(grid).total;
            const cantidad = favoritasTabla.length;
            const posiciones = this.getPosicionesPorUbicacion(ubicacion, grid, cantidad);
            
            const resultado = [];
            for (let i = 0; i < posiciones.length && i < favoritasTabla.length; i++) {
                resultado.push({
                    posicion: posiciones[i],
                    favorita: favoritasTabla[i]
                });
            }
            return resultado;
        }

        static generarEstructuraCompleta(favoritas, totalTablas, grid, ubicacion) {
            const distribucion = this.distribuirFavoritas(favoritas, totalTablas, grid, ubicacion);
            
            const resultado = [];
            for (let i = 0; i < distribucion.length; i++) {
                const favoritasTabla = distribucion[i] || [];
                const posiciones = this.getPosicionesParaTabla(favoritasTabla, grid, ubicacion);
                resultado.push({
                    tablaIndex: i,
                    favoritas: favoritasTabla,
                    posiciones: posiciones,
                    cantidad: favoritasTabla.length
                });
            }
            
            return resultado;
        }
    }

    window.FavoritasLogic = FavoritasLogic;
    console.log('📦 FavoritasLogic.js cargado correctamente');

})();
