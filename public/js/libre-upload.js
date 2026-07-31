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
            this.targetIndex = null;
            
            this.init();
        }

        selectImageForIndex(index) {
    if (index >= this.maxImages) return;
    if (this.images[index] && !confirm('¿Reemplazar esta imagen?')) return;
    this.targetIndex = index;
    this.fileInput.click();
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
            // Seleccionar imágenes
            document.getElementById('j-libre-select-images').addEventListener('click', () => {
                this.fileInput.click();
            });

            // Input file
            this.fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
                this.fileInput.value = '';
            });

            // Limpiar todo
            document.getElementById('j-libre-clear-all').addEventListener('click', () => {
                if (this.images.length === 0) return;
                if (confirm('Eliminar todas las imagenes?')) {
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

            // Drag and drop
            this.grid.addEventListener('dragover', (e) => e.preventDefault());
            this.grid.addEventListener('drop', (e) => {
                e.preventDefault();
                if (e.dataTransfer.files.length > 0) {
                    this.handleFiles(e.dataTransfer.files);
                }
            });
        }

        handleFiles(files) {
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

        removeImage(index) {
            const realIndex = (this.currentGroup * 18) + index;
            if (realIndex >= this.images.length) return;
            
            this.images.splice(realIndex, 1);
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

        renderGrid() {
            if (!this.grid) return;
            this.grid.innerHTML = '';
            
            const start = this.currentGroup * 18;
            const end = Math.min(start + 18, this.maxImages);
            
            for (let i = start; i < end; i++) {
                if (i < this.images.length) {
                    const img = this.images[i];
                    const item = document.createElement('div');
                    item.className = 'j-libre-item';
                    item.innerHTML = `
                        <img src="${img.data}" alt="${img.name}">
                        <span class="j-libre-number">#${i + 1}</span>
                        <button class="j-libre-remove" data-index="${i - start}">✕</button>
                    `;
                    item.querySelector('.j-libre-remove').addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.removeImage(parseInt(e.target.dataset.index));
                    });
                    this.grid.appendChild(item);
                } else {
                    const placeholder = document.createElement('div');
                    placeholder.className = 'j-libre-item-placeholder';
                    placeholder.textContent = '+';
                    this.grid.appendChild(placeholder);
                }
            }
        }

        updateCounter() {
            if (!this.counter) return;
            const total = this.images.length;
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
                JuguemosState.libreImages = this.images;
                JuguemosState.libreImagesCount = this.images.length;
                JuguemosState.isLibreComplete = this.images.length === this.maxImages;
            }
            if (typeof updateOrderSummary === 'function') {
                updateOrderSummary();
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.LibreUploadInstance = new LibreUpload();
    });

})();
