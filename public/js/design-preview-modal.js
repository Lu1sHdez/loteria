/**
 * =====================================================
 * DESIGN PREVIEW MODAL - Ver todas las barajas del diseño
 * =====================================================
 * Módulo independiente que no afecta otras funcionalidades
 * 
 * 🔥 VERSIÓN CORREGIDA: El botón siempre aparece al cambiar de diseño
 */

(function() {
    'use strict';

    class DesignPreviewModal {
        constructor() {
            this.modal = null;
            this.overlay = null;
            this.designId = null;
            this.barajas = [];
            this.ultimoDiseno = null;
            this.init();
        }

        init() {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setup());
            } else {
                this.setup();
            }
        }

        setup() {
            this.createModalStructure();

            // 🔥 MÉTODO PRINCIPAL: Observar cambios en JuguemosState.deck
            this.observarCambioDiseno();

            // 🔥 OBSERVAR CAMBIOS EN LA VISTA PREVIA
            this.observeDesignPreview();

            // 🔥 OBSERVAR CAMBIOS EN EL TÍTULO
            this.observeTitleChanges();

            // Escuchar clicks en el botón
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

            // 🔥 AGREGAR BOTÓN INICIAL
            setTimeout(() => this.addButtonToPreview(), 500);
        }

        /**
         * 🔥 OBSERVA CAMBIOS EN JuguemosState.deck
         * Esta es la clave para que el botón aparezca al seleccionar otro diseño
         */
        observarCambioDiseno() {
            // Usar setInterval para monitorear cambios en el deck
            setInterval(() => {
                const deckActual = JuguemosState?.deck || null;
                
                if (deckActual !== this.ultimoDiseno) {
                    this.ultimoDiseno = deckActual;
                    console.log('🔄 Diseño cambiado a:', deckActual);
                    
                    // Esperar a que se cargue la vista previa
                    setTimeout(() => {
                        this.addButtonToPreview();
                    }, 300);
                }
            }, 300);

            // 🔥 También escuchar evento gridChanged
            document.addEventListener('gridChanged', () => {
                console.log('🔄 gridChanged detectado');
                setTimeout(() => {
                    this.addButtonToPreview();
                }, 200);
            });
        }

        /**
         * 🔥 OBSERVA CAMBIOS EN EL TÍTULO
         */
        observeTitleChanges() {
            const previewTitle = document.querySelector('.j-preview-title');
            if (!previewTitle) return;

            const observer = new MutationObserver(() => {
                console.log('🔄 Título cambiado');
                setTimeout(() => this.addButtonToPreview(), 100);
            });

            observer.observe(previewTitle, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }

        /**
         * Crea la estructura HTML del modal
         */
        createModalStructure() {
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

            this.overlay = document.getElementById('j-design-preview-overlay');
            this.modal = document.getElementById('j-design-preview-modal');

            document.getElementById('j-design-preview-close').addEventListener('click', () => this.closeModal());
            document.getElementById('j-design-preview-close-btn').addEventListener('click', () => this.closeModal());
            
            this.overlay.addEventListener('click', (e) => {
                if (e.target === this.overlay) this.closeModal();
            });
        }

        /**
         * Observa cambios en la vista previa del diseño (fallback)
         */
        observeDesignPreview() {
            const previewContainer = document.getElementById('deck-preview');
            if (!previewContainer) return;

            const observer = new MutationObserver(() => {
                console.log('🔄 deck-preview mutado');
                setTimeout(() => this.addButtonToPreview(), 150);
            });

            observer.observe(previewContainer, {
                childList: true,
                subtree: true,
                characterData: true,
                attributes: true
            });
        }

        addButtonToPreview() {
            const desktopContainer = document.getElementById('deck-preview');
            if (!desktopContainer) return;

            const previewTitle = desktopContainer.querySelector('.j-preview-title');
            if (!previewTitle) return;

            const titleText = previewTitle.querySelector('p');
            if (!titleText || !titleText.textContent.trim()) {
                const existingBtn = previewTitle.querySelector('#j-view-full-design');
                if (existingBtn) existingBtn.remove();
                return;
            }

            const barajas = JuguemosState?.barajas || [];
            if (barajas.length === 0) return;

            const existingBtn = previewTitle.querySelector('#j-view-full-design');
            if (existingBtn) {
                if (existingBtn.style.display === 'none') {
                    existingBtn.style.display = '';
                }
                return;
            }

            const button = document.createElement('button');
            button.id = 'j-view-full-design';
            button.className = 'j-view-full-design-btn';
            button.innerHTML = `
                <img src="/wp-content/uploads/2026/08/ver-diseno.png" alt="Ver diseño" class="j-view-full-icon" loading="lazy">
                Ver diseño completo
            `;

            previewTitle.appendChild(button);
        }

        /**
         * Abre el modal con las barajas del diseño
         */
        async openModal() {
            const designId = JuguemosState?.deck;
            if (!designId) {
                alert('Primero selecciona un diseño.');
                return;
            }

            const barajas = JuguemosState?.barajas || [];
            if (barajas.length === 0) {
                try {
                    await this.loadBarajas(designId);
                } catch (error) {
                    alert('No se pudieron cargar las barajas. Intenta nuevamente.');
                    return;
                }
            }

            const designName = document.querySelector('.j-preview-title p')?.textContent || 'Diseño';
            this.renderBarajas(designName);
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        /**
         * Carga las barajas del diseño
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

            if (title) title.textContent = `${designName}`;
            if (count) count.textContent = `${barajas.length} barajas`;

            if (barajas.length === 0) {
                grid.innerHTML = `
                    <div class="j-design-preview-empty">
                        <p>No hay barajas disponibles para este diseño.</p>
                    </div>
                `;
                return;
            }

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
