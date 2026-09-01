/**
 * =====================================================
 * DESIGN PREVIEW MODAL - Carga Instantánea (Ultra Rápida)
 * =====================================================
 */

(function() {
    'use strict';

    class DesignPreviewModal {
        constructor() {
            this.modal = null;
            this.overlay = null;
            this.designId = null;
            this.ultimoDiseno = null;
            this.watermarkUrl = '/wp-content/uploads/2026/07/marca_agua.png';
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
            this.observarCambioDiseno();
            this.observeDesignPreview();
            this.observeTitleChanges();

            document.addEventListener('click', (e) => {
                if (e.target.matches('#j-view-full-design') || e.target.closest('#j-view-full-design')) {
                    this.openModal();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
                    this.closeModal();
                }
            });

            setTimeout(() => this.addButtonToPreview(), 500);
        }

        observarCambioDiseno() {
            setInterval(() => {
                const deckActual = JuguemosState?.deck || null;
                if (deckActual !== this.ultimoDiseno) {
                    this.ultimoDiseno = deckActual;
                    setTimeout(() => this.addButtonToPreview(), 300);
                }
            }, 300);

            document.addEventListener('gridChanged', () => {
                setTimeout(() => this.addButtonToPreview(), 200);
            });
        }

        observeTitleChanges() {
            const previewTitle = document.querySelector('.j-preview-title');
            if (!previewTitle) return;

            const observer = new MutationObserver(() => {
                setTimeout(() => this.addButtonToPreview(), 100);
            });

            observer.observe(previewTitle, { childList: true, subtree: true, characterData: true });
        }

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
                            <div id="j-design-preview-grid" class="j-design-preview-grid"></div>
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

        observeDesignPreview() {
            const previewContainer = document.getElementById('deck-preview');
            if (!previewContainer) return;

            const observer = new MutationObserver(() => {
                setTimeout(() => this.addButtonToPreview(), 150);
            });

            observer.observe(previewContainer, { childList: true, subtree: true, characterData: true, attributes: true });
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
                if (existingBtn.style.display === 'none') existingBtn.style.display = '';
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
         * ABRE EL MODAL DE INMEDIATO
         */
        async openModal() {
            const designId = JuguemosState?.deck;
            if (!designId) {
                alert('Primero selecciona un diseño.');
                return;
            }

            const designName = document.querySelector('.j-preview-title p')?.textContent || 'Diseño';
            const title = document.getElementById('j-design-preview-title');
            if (title) title.textContent = designName;

            // 1. ABRIR VENTANA INMEDIATAMENTE
            this.overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            let barajas = JuguemosState?.barajas || [];

            // 2. Si no están en JS, traer por AJAX
            if (barajas.length === 0) {
                const grid = document.getElementById('j-design-preview-grid');
                if (grid) {
                    grid.innerHTML = `
                        <div class="j-design-preview-loading">
                            <div class="j-design-spinner"></div>
                            <p>Cargando información...</p>
                        </div>
                    `;
                }
                try {
                    barajas = await this.loadBarajas(designId);
                } catch (error) {
                    this.renderEmptyState('No se pudieron cargar las barajas.');
                    return;
                }
            }

            // 3. Renderizar al instante con marca de agua CSS
            this.renderBarajasInstantly(designName, barajas);
        }

        loadBarajas(designId) {
            return new Promise((resolve, reject) => {
                fetch(`${Juguemos.ajax_url}?action=juguemos_barajas&design_id=${encodeURIComponent(designId)}`)
                .then(r => r.json())
                .then(response => {
                    if (!response.success || !response.data.length) {
                        reject(new Error('No hay barajas'));
                        return;
                    }
                    JuguemosState.barajas = response.data;
                    resolve(response.data);
                })
                .catch(reject);
            });
        }

        /**
         * Renderizado ultrafast: inserta el HTML en un solo golpe
         * Usa overlay CSS para la marca de agua (evita canvas lento)
         */
        renderBarajasInstantly(designName, barajas) {
            const grid = document.getElementById('j-design-preview-grid');
            const count = document.getElementById('j-design-preview-count');

            if (!grid) return;
            if (count) count.textContent = `${barajas.length} barajas`;

            if (!barajas || barajas.length === 0) {
                this.renderEmptyState('No hay barajas disponibles.');
                return;
            }

            // Construir todo el HTML directo
            let html = '';
            for (let index = 0; index < barajas.length; index++) {
                const baraja = barajas[index];
                html += `
                    <div class="j-design-preview-card">
                        <div class="j-design-preview-card-image">
                            <img src="${baraja.imagen}" alt="${baraja.nombre || `Baraja ${index + 1}`}" loading="lazy">
                            <div class="j-watermark-overlay" style="background-image: url('${this.watermarkUrl}');"></div>
                        </div>
                        <div class="j-design-preview-card-info">
                            <span class="j-design-preview-card-number">#${baraja.numero || index + 1}</span>
                            <span class="j-design-preview-card-name">${baraja.nombre || ''}</span>
                        </div>
                    </div>
                `;
            }

            grid.innerHTML = html;
        }

        renderEmptyState(mensaje) {
            const grid = document.getElementById('j-design-preview-grid');
            const count = document.getElementById('j-design-preview-count');
            
            if (count) count.textContent = '0 barajas';
            if (grid) {
                grid.innerHTML = `<div class="j-design-preview-empty"><p>${mensaje}</p></div>`;
            }
        }

        closeModal() {
            if (this.overlay) {
                this.overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    }

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new DesignPreviewModal();
        }
        return instance;
    }

    window.DesignPreviewModal = {
        init: () => getInstance(),
        open: () => getInstance().openModal()
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.DesignPreviewModal.init());
    } else {
        window.DesignPreviewModal.init();
    }
})();
