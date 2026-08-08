(function() {
    'use strict';

    class LibreUpload {
        constructor() {
            this.images = [];
            this.maxImages = 54;
            this.currentGroup = 0;
            this.container = document.getElementById('j-libre-upload');
            this.grid = document.getElementById('j-libre-grid');
            this.counter = document.getElementById('j-libre-counter');
            this.status = document.getElementById('j-libre-status');
            this.fileInput = document.getElementById('j-libre-file-input');
            
            // ✅ ALMACENAR ÍNDICE TARGET PARA SUBIDA INDIVIDUAL
            this.targetIndex = null;
            
            this.init();
        }

        init() {
            if (!this.container) return;
            
            this.bindEvents();
            this.renderGrid();
            this.updateCounter();
            this.toggleVisibility(JuguemosState.mode === 'libre');
            
            console.log('LibreUpload iniciado');
        }

        bindEvents() {
            // Seleccionar imágenes (botón principal)
            document.getElementById('j-libre-select-images').addEventListener('click', () => {
                this.targetIndex = null; // ✅ NULL = SUBIDA MÚLTIPLE
                this.fileInput.click();
            });

            // Input file - MANEJO UNIFICADO
            this.fileInput.addEventListener('change', (e) => {
                const files = e.target.files;
                
                if (this.targetIndex !== null) {
                    // ✅ SUBIDA INDIVIDUAL (desde un +)
                    this.handleSingleUpload(files[0], this.targetIndex);
                } else {
                    // ✅ SUBIDA MÚLTIPLE (desde botón)
                    this.handleMultipleUpload(files);
                }
                
                this.fileInput.value = '';
                this.targetIndex = null;
            });

            document.getElementById('j-libre-clear-all').addEventListener('click', () => {
                if (this.images.length === 0) return;
                if (confirm('¿Eliminar todas las imágenes?')) {
                    this.clearAll();
                }
            });

            // Navegación por grupos
            document.querySelectorAll('.j-libre-nav-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.j-libre-nav-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.currentGroup = parseInt(btn.dataset.group);
                    this.renderGrid();
                });
            });

            // Drag and drop (solo múltiple)
            this.grid.addEventListener('dragover', (e) => e.preventDefault());
            this.grid.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    this.targetIndex = null;
                    this.handleMultipleUpload(e.dataTransfer.files);
                }
            });
        }

        // ✅ MÉTODO PARA SUBIDA INDIVIDUAL (desde +)
        handleSingleUpload(file, index) {
            if (!file) return;
            if (index >= this.maxImages) return;
            
            // Validar archivo
            if (!file.type.startsWith('image/')) {
                this.showStatus('error', `"${file.name}" no es una imagen.`);
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                this.showStatus('error', `"${file.name}" excede 2MB.`);
                return;
            }

            // Si ya existe imagen en esa posición, preguntar si reemplazar
            if (this.images[index]) {
                if (!confirm(`¿Reemplazar la imagen en la posición ${index + 1}?`)) {
                    return;
                }
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Insertar en la posición específica
                this.images[index] = {
                    data: e.target.result,
                    name: file.name
                };
                
                this.renderGrid();
                this.updateCounter();
                this.updateJuguemosState();
                this.showStatus('success', `Imagen ${index + 1} subida correctamente.`);
                
                // Ocultar mensaje después de 2 segundos
                setTimeout(() => this.hideStatus(), 2000);
            };
            reader.readAsDataURL(file);
        }

        // ✅ MÉTODO PARA SUBIDA MÚLTIPLE (desde botón o drag)
        handleMultipleUpload(files) {
            const remaining = this.maxImages - this.images.length;
            if (remaining <= 0) {
                this.showStatus('error', 'Ya subiste 54 imagenes. Elimina algunas para agregar mas.');
                return;
            }

            const filesToProcess = Math.min(files.length, remaining);
            let processed = 0;

            for (let i = 0; i < filesToProcess; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;
                if (file.size > 2 * 1024 * 1024) {
                    this.showStatus('error', `"${file.name}" excede 2MB.`);
                    continue;
                }

                const reader = new FileReader();
                reader.onload = (e) => {
                    this.images.push({
                        data: e.target.result,
                        name: file.name
                    });
                    processed++;
                    this.renderGrid();
                    this.updateCounter();
                    
                    if (this.images.length === this.maxImages) {
                        this.showStatus('success', 'Completaste las 54 imagenes!');
                    } else {
                        this.hideStatus();
                    }
                    this.updateJuguemosState();
                };
                reader.readAsDataURL(file);
            }
        }

        // ✅ RENDERIZADO CON MANEJO DE CLIC EN "+"
        renderGrid() {
            if (!this.grid) return;
            this.grid.innerHTML = '';
            
            const start = this.currentGroup * 18;
            const end = Math.min(start + 18, this.maxImages);
            
            for (let i = start; i < end; i++) {
                const realIndex = i;
                
                if (i < this.images.length && this.images[i]) {
                    // ✅ IMAGEN EXISTENTE
                    const img = this.images[i];
                    const item = document.createElement('div');
                    item.className = 'j-libre-item';
                    item.innerHTML = `
                        <img src="${img.data}" alt="${img.name}">
                        <span class="j-libre-number">#${i + 1}</span>
                        <button class="j-libre-remove" data-index="${i}">✕</button>
                    `;
                    
                    // Click en la imagen para reemplazar
                    item.addEventListener('click', () => {
                        this.selectImageForIndex(i);
                    });
                    
                    item.querySelector('.j-libre-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeImage(parseInt(e.target.dataset.index));
                    });
                    
                    this.grid.appendChild(item);
                } else {
                    // ✅ PLACEHOLDER "+" - CLICK PARA SUBIR
                    const placeholder = document.createElement('div');
                    placeholder.className = 'j-libre-item-placeholder';
                    placeholder.textContent = '+';
                    placeholder.style.cursor = 'pointer';
                    placeholder.style.display = 'flex';
                    placeholder.style.alignItems = 'center';
                    placeholder.style.justifyContent = 'center';
                    placeholder.style.fontSize = '32px';
                    placeholder.style.fontWeight = '700';
                    placeholder.style.color = '#CCC';
                    placeholder.style.background = '#F5F5F5';
                    placeholder.style.borderRadius = '6px';
                    placeholder.style.aspectRatio = '2/3';
                    placeholder.style.transition = 'all 0.3s ease';
                    
                    // Hover effect
                    placeholder.addEventListener('mouseenter', () => {
                        placeholder.style.background = '#E8E8E8';
                        placeholder.style.transform = 'scale(1.02)';
                        placeholder.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    });
                    
                    placeholder.addEventListener('mouseleave', () => {
                        placeholder.style.background = '#F5F5F5';
                        placeholder.style.transform = 'scale(1)';
                        placeholder.style.boxShadow = 'none';
                    });
                    
                    // ✅ CLICK PARA SUBIR IMAGEN EN ESTA POSICIÓN
                    placeholder.addEventListener('click', () => {
                        this.selectImageForIndex(i);
                    });
                    
                    this.grid.appendChild(placeholder);
                }
            }
        }

        // ✅ MÉTODO PARA SELECCIONAR IMAGEN PARA UN ÍNDICE ESPECÍFICO
        selectImageForIndex(index) {
            if (index >= this.maxImages) return;
            
            // Si ya tiene imagen, preguntar si reemplazar
            if (this.images[index]) {
                if (!confirm(`¿Reemplazar la imagen en la posición ${index + 1}?`)) {
                    return;
                }
            }
            
            this.targetIndex = index;
            this.fileInput.click();
        }

        removeImage(index) {
            if (index >= this.images.length) return;
            
            this.images[index] = null;
            
            // ✅ COMPACTAR: eliminar nulls y reordenar
            this.images = this.images.filter(img => img !== null && img !== undefined);
            
            this.renderGrid();
            this.updateCounter();
            this.updateJuguemosState();
            
            if (this.images.length === 0) {
                this.showStatus('info', 'Selecciona 54 imagenes personalizadas para continuar.');
            } else {
                this.hideStatus();
            }
        }

        clearAll() {
            this.images = [];
            this.renderGrid();
            this.updateCounter();
            this.updateJuguemosState();
            this.showStatus('info', 'Selecciona 54 imagenes personalizadas para continuar.');
        }

        updateCounter() {
            if (!this.counter) return;
            const total = this.images.filter(img => img !== null && img !== undefined).length;
            this.counter.textContent = `${total} / ${this.maxImages}`;
            this.counter.classList.toggle('complete', total === this.maxImages);
        }

        showStatus(type, message) {
            if (!this.status) return;
            this.status.className = `j-libre-status ${type}`;
            this.status.textContent = message;
            this.status.style.display = 'block';
        }

        hideStatus() {
            if (!this.status) return;
            this.status.style.display = 'none';
        }

        updateJuguemosState() {
            if (typeof JuguemosState !== 'undefined') {
                const imagenesValidas = this.images.filter(img => img !== null && img !== undefined);
                JuguemosState.libreImages = imagenesValidas;
                JuguemosState.libreImagesCount = imagenesValidas.length;
                JuguemosState.isLibreComplete = imagenesValidas.length === this.maxImages;
            }
            if (typeof updateOrderSummary === 'function') {
                updateOrderSummary();
            }
        }

        toggleVisibility(show) {
            if (!this.container) return;
            this.container.style.display = show ? 'block' : 'none';
        }
    }

    // =========================================================
    // EXPOSICIÓN GLOBAL
    // =========================================================

    let instance = null;

    function getInstance() {
        if (!instance) {
            instance = new LibreUpload();
        }
        return instance;
    }

    window.LibreUpload = {
        init: function() {
            getInstance();
        },
        refresh: function() {
            getInstance().renderGrid();
                    getInstance().updateCounter();
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        window.LibreUploadInstance = getInstance();
    });

    console.log('📦 LibreUpload.js cargado correctamente (con soporte para +)');

})();
