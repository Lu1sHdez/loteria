window.JuguemosPDF = {

    captureScale: 3,

    esperarImagenes(container) {
        const imgs = Array.from(container.querySelectorAll('img'));
        const promesas = imgs.map(img => {
            if (img.complete && img.naturalWidth !== 0) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                const timeout = setTimeout(() => {
                    resolve();
                }, 8000);
                
                const onLoad = () => {
                    clearTimeout(timeout);
                    resolve();
                };
                
                img.addEventListener('load', onLoad, { once: true });
                img.addEventListener('error', onLoad, { once: true });
            });
        });
        return Promise.all(promesas);
    },

    async generate() {
        const btn = document.getElementById('j-download-pdf');
        const btnText = document.getElementById('j-download-text');
        const spinner = document.getElementById('j-download-spinner');
        const progress = document.getElementById('j-pdf-progress');
        const progressCount = document.getElementById('j-pdf-progress-count');
        const progressBar = document.getElementById('j-pdf-progress-bar');
        const statusText = document.getElementById('j-pdf-status');
    
        // Mostrar estado de carga
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
        }
        if (btnText) btnText.textContent = 'Descargando PDF...';
        if (spinner) spinner.style.display = 'inline-block';
        
        // Mostrar barra de progreso
        if (progress) progress.style.display = 'block';
        if (progressBar) progressBar.style.width = '0%';
        if (statusText) statusText.textContent = 'Preparando...';
    
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('No se pudieron cargar las librerias de PDF. Revisa tu conexion.');
            this.restoreButton(btn, btnText, spinner);
            return;
        }
    
        if (typeof JuguemosState === 'undefined' || typeof PrintPaper === 'undefined') {
            alert('No se pudo acceder a la configuracion de la loteria.');
            this.restoreButton(btn, btnText, spinner);
            return;
        }
    
        const { jsPDF } = window.jspdf;
    
        const stepPreview = document.getElementById('juguemos-preview-completo');
        let stepWasHidden = false;
    
        if (stepPreview && !stepPreview.classList.contains('active')) {
            stepWasHidden = true;
            stepPreview.classList.add('active');
            stepPreview.style.position = 'fixed';
            stepPreview.style.top = '0';
            stepPreview.style.left = '-99999px';
            stepPreview.style.zIndex = '-1';
            stepPreview.style.width = '100%';
        }
    
        PrintPaper.render();
    
        await new Promise(resolve => setTimeout(resolve, 500));
    
        const container = document.getElementById('j-print-preview');
        const sheets = container ? Array.from(container.querySelectorAll('.j-sheet')) : [];
    
        if (sheets.length === 0) {
            alert('No hay vista previa generada. Ve al paso 3 y configura tu loteria.');
            this.restoreStep(stepPreview, stepWasHidden);
            this.restoreButton(btn, btnText, spinner);
            if (progress) progress.style.display = 'none';
            return;
        }
    
        if (btnText) btnText.textContent = 'Descargando PDF...';
        
        const paperConfig = PrintPaper.getPaperConfig();
        const orientation = paperConfig.orientation === 'horizontal' ? 'landscape' : 'portrait';
    
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [paperConfig.width, paperConfig.height]
        });
    
        const totalPages = sheets.length;
    
        try {
            for (let i = 0; i < sheets.length; i++) {
                // Actualizar progreso
                const percent = Math.round(((i + 1) / sheets.length) * 100);
                
                if (progressCount) {
                    progressCount.textContent = i + 1 + '/' + sheets.length;
                }
                if (progressBar) {
                    progressBar.style.width = percent + '%';
                }
                if (btnText) {
                    btnText.textContent = 'Descargando ' + (i + 1) + '/' + sheets.length + '...';
                }
                if (statusText) {
                    statusText.textContent = 'Pagina ' + (i + 1) + ' de ' + sheets.length;
                }
    
                const sheet = sheets[i];

                // Ocultar la marca de agua para el PDF
                sheet.querySelectorAll('.j-board-grid, .j-barajas-grid').forEach(grid => {
                    grid.classList.add('pdf-export');
                });
    
                sheets.forEach((s, index) => {
                    if (index !== i) {
                        s.style.display = 'none';
                    } else {
                        s.style.display = 'block';
                        s.style.visibility = 'visible';
                        s.style.opacity = '1';
                    }
                });
    
                sheet.offsetHeight;
    
                await this.esperarImagenes(sheet);
    
                await new Promise(resolve => setTimeout(resolve, 400));
    
                const canvas = await html2canvas(sheet, {
                    scale: this.captureScale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#FFFFFF',
                    logging: false,
                    onclone: (clonedDoc, element) => {
                        return new Promise((resolve) => {
                            setTimeout(resolve, 300);
                        });
                    }
                });
    
                const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
                if (i > 0) {
                    pdf.addPage([paperConfig.width, paperConfig.height], orientation);
                }
    
                pdf.addImage(
                    imgData,
                    'JPEG',
                    0,
                    0,
                    paperConfig.width,
                    paperConfig.height
                );
    
                sheet.querySelectorAll('.j-board-grid, .j-barajas-grid').forEach(grid => {
                    grid.classList.remove('pdf-export');
                });

                sheets.forEach((s) => {
                    s.style.display = '';
                });
    
                await new Promise(resolve => setTimeout(resolve, 200));
            }
    
            if (statusText) {
                statusText.textContent = 'Listo';
            }
            if (progressBar) {
                progressBar.style.width = '100%';
            }
            if (btnText) {
                btnText.textContent = 'Preparando descarga...';
            }
            
            await new Promise(resolve => setTimeout(resolve, 300));

            const nombreArchivo = 'loteria-la-dama-' + Date.now() + '.pdf';
            pdf.save(nombreArchivo);
    
            // Limpiar session storage
            sessionStorage.removeItem('juguemos_payment_verified');
            sessionStorage.removeItem('juguemos_payment_token');
            sessionStorage.removeItem('juguemos_page_loaded');
            sessionStorage.removeItem('juguemos_order_id');
            sessionStorage.removeItem('juguemos_payment_just_made');
            sessionStorage.removeItem('juguemos_monto_pagado');
    
            if (btnText) btnText.textContent = 'PDF descargado';
            if (statusText) statusText.textContent = 'Completado';
    
            setTimeout(function() {
                window.location.href = '/juguemos';
            }, 2000);
    
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Ocurrio un error al generar el PDF. Revisa la consola para mas detalles.');
            if (statusText) statusText.textContent = 'Error';
        } finally {
            this.restoreButton(btn, btnText, spinner);
            if (progress) progress.style.display = 'none';
            this.restoreStep(stepPreview, stepWasHidden);
            
            if (container) {
                container.querySelectorAll('.j-sheet').forEach(s => {
                    s.style.display = '';
                    s.style.visibility = '';
                    s.style.opacity = '';
                });
            }
        }
    },
    
    restoreButton(btn, btnText, spinner) {
        if (btn) {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        }
        if (btnText) btnText.textContent = 'Descargar PDF';
        if (spinner) spinner.style.display = 'none';
    },
    
    restoreStep(stepPreview, stepWasHidden) {
        if (!stepPreview || !stepWasHidden) return;
        stepPreview.classList.remove('active');
        stepPreview.style.position = '';
        stepPreview.style.top = '';
        stepPreview.style.left = '';
        stepPreview.style.zIndex = '';
        stepPreview.style.width = '';
    }
};
