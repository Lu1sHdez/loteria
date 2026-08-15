/**
 * =====================================================
 * DESIGN PREVIEW MODAL - Ver todas las barajas del diseño
 * =====================================================
 * Módulo independiente que no afecta otras funcionalidades
 */

(function() {
    'use strict';

    class DesignPreviewModal {
        constructor() {
            this.modal = null;
            this.overlay = null;
            this.designId = null;
            this.barajas = [];
            this.init();
        }

        init() {
            // Esperar a que el DOM esté listo
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            // Crear estructura del modal (una sola vez)
            this.createModalStructure();

            // Observar cambios en la vista previa del diseño
            this.observeDesignPreview();

            // Escuchar clicks en el botón (delegación de eventos)
            document.addEventListener('click', (e) => {
                if (e.target.matches('#j-view-full-design') || e.target.closest('#j-view-full-design')) {
                    this.openModal();
                }
            });

            // Cerrar modal con ESC
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });

            console.log('📦 DesignPreviewModal: Módulo inicializado');
        }

        /**
         * Crea la estructura HTML del modal
         */
        createModalStructure() {
            // Evitar duplicados
            if (document.getElementById('j-design-preview-modal')) return;

            const modalHTML = `
                <div id="j-design-preview-overlay" class="j-design-preview-overlay">
                    <div id="j-design-preview-modal" class="j-design-preview-modal">
                        <div class="j-design-preview-header">
                            <h3 id="j-design-preview-title">Diseño completo</h3>
                            <button id="j-design-preview-close" class="j-design-preview-close">×</button>
                        </div>
                        <div class="j-design-preview-body">
                            <div id="j-design-preview-grid" class="j-design-preview-grid">
                                <div class="j-design-preview-loading">
                                    <div class="j-spinner"></div>
                                    <p>Cargando barajas...</p>
                                </div>
                            </div>
                        </div>
                        <div class="j-design-preview-footer">
                            <span id="j-design-preview-count">0 barajas</span>
                            <button id="j-design-preview-close-btn" class="j-btn-back">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Referencias a elementos
            this.overlay = document.getElementById('j-design-preview-overlay');
            this.modal = document.getElementById('j-design-preview-modal');

            // Eventos de cierre
            document.getElementById('j-design-preview-close').addEventListener('click', () => this.closeModal());
            document.getElementById('j-design-preview-close-btn').addEventListener('click', () => this.closeModal());
            
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.closeModal();
            });
        }

        /**
         * Observa cambios en la vista previa del diseño
         * para agregar el botón cuando se cargue un diseño
         */
        observeDesignPreview() {
            // Escuchar cambios en el contenedor deck-preview
            const previewContainer = document.getElementById('deck-preview');
            if (!previewContainer) return;

            // Usar MutationObserver para detectar cuando se actualiza la vista previa
            const observer = new MutationObserver(() => {
                this.addButtonToPreview();
            });

            observer.observe(previewContainer, {
                childList: true,
                subtree: true,
                characterData: true
            });

            // También intentar agregar el botón inicialmente
            setTimeout(() => this.addButtonToPreview(), 500);
        }

        /**
         * Agrega el botón "Ver diseño completo" debajo del nombre del diseño
         */
        addButtonToPreview() {
            const previewTitle = document.querySelector('.j-preview-title');
            if (!previewTitle) return;

            // Verificar si el botón ya existe
            if (document.getElementById('j-view-full-design')) return;

            // Verificar que hay un diseño cargado (tiene un p con texto)
            const titleText = previewTitle.querySelector('p');
            if (!titleText || !titleText.textContent.trim()) return;

            // Crear botón
            const button = document.createElement('button');
            button.id = 'j-view-full-design';
            button.className = 'j-view-full-design-btn';
            button.innerHTML = `
                <img src="/wp-content/uploads/2026/08/ver-diseno.png" alt="Ver diseño" class="j-view-full-icon" loading="lazy">
                Ver diseño completo
            `;

            // Insertar después del título
            previewTitle.appendChild(button);
        }

        /**
         * Abre el modal con las barajas del diseño
         */
        async openModal() {
            // Obtener el diseño actual
            const designId = JuguemosState?.deck;
            if (!designId) {
                alert('Primero selecciona un diseño.');
                return;
            }

            // Obtener las barajas
            const barajas = JuguemosState?.barajas || [];
            if (barajas.length === 0) {
                // Intentar cargar barajas si no están disponibles
                try {
                    await this.loadBarajas(designId);
                } catch (error) {
                    alert('No se pudieron cargar las barajas. Intenta nuevamente.');
                    return;
                }
            }

            // Obtener el nombre del diseño
            const designName = document.querySelector('.j-preview-title p')?.textContent || 'Diseño';

            // Mostrar modal
            this.renderBarajas(designName);
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        /**
         * Carga las barajas del diseño si no están disponibles
         */
        loadBarajas(designId) {
            return new Promise((resolve, reject) => {
                fetch(
                    Juguemos.ajax_url +
                    "?action=juguemos_barajas&design_id=" +
                    encodeURIComponent(designId)
                )
                .then(r => r.json())
                .then(response => {
                    if (!response.success || !response.data.length) {
                        reject(new Error('No hay barajas disponibles'));
                        return;
                    }
                    JuguemosState.barajas = response.data;
                    resolve(response.data);
                })
                .catch(error => {
                    reject(error);
                });
            });
        }

        /**
         * Renderiza las barajas en el modal
         */
        renderBarajas(designName) {
            const grid = document.getElementById('j-design-preview-grid');
            const title = document.getElementById('j-design-preview-title');
            const count = document.getElementById('j-design-preview-count');

            if (!grid) return;

            const barajas = JuguemosState?.barajas || [];

            // Actualizar título
            if (title) title.textContent = `${designName} - 54 barajas`;

            // Actualizar contador
            if (count) count.textContent = `${barajas.length} barajas`;

            // Si no hay barajas, mostrar mensaje
            if (barajas.length === 0) {
                grid.innerHTML = `
                    <div class="j-design-preview-empty">
                        <p>No hay barajas disponibles para este diseño.</p>
                    </div>
                `;
                return;
            }

            // Generar grid de barajas
            let html = '';
            barajas.forEach((baraja, index) => {
                html += `
                    <div class="j-design-preview-card">
                        <div class="j-design-preview-card-image">
                            <img src="${baraja.imagen || ''}" alt="${baraja.nombre || `Baraja ${index + 1}`}" loading="lazy">
                        </div>
                        <div class="j-design-preview-card-info">
                            <span class="j-design-preview-card-number">#${baraja.numero || index + 1}</span>
                            <span class="j-design-preview-card-name">${baraja.nombre || ''}</span>
                        </div>
                    </div>
                `;
            });

            grid.innerHTML = html;
        }

        /**
         * Cierra el modal
         */
        closeModal() {
            if (this.overlay) {
                this.overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new DesignPreviewModal();
        }
        return instance;
    }

    window.DesignPreviewModal = {
        init: function() {
            getInstance();
        },
        open: function() {
            getInstance().openModal();
        }
    };

    // Inicializar automáticamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.DesignPreviewModal.init();
        });
    } else {
        window.DesignPreviewModal.init();
    }
})();
