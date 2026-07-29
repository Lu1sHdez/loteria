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
    
        // ✅ MOSTRAR ESTADO DE CARGA
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.7';
            btn.style.cursor = 'wait';
        }
        if (btnText) btnText.textContent = 'Descargando...';
        if (spinner) spinner.style.display = 'inline-block';
    
        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('No se pudieron cargar las librerías de PDF. Revisa tu conexión.');
            this.restoreButton(btn, btnText, spinner);
            return;
        }
    
        if (typeof JuguemosState === 'undefined' || typeof PrintPaper === 'undefined') {
            alert('No se pudo acceder a la configuración de la lotería.');
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
            alert('No hay vista previa generada. Ve al paso 3 y configura tu lotería.');
            this.restoreStep(stepPreview, stepWasHidden);
            this.restoreButton(btn, btnText, spinner);
            return;
        }
    
        if (btnText) btnText.textContent = 'Descargando...';
        if (progress) progress.style.display = 'block';
    
        const paperConfig = PrintPaper.getPaperConfig();
        const orientation = paperConfig.orientation === 'horizontal' ? 'landscape' : 'portrait';
    
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [paperConfig.width, paperConfig.height]
        });
    
        try {
            for (let i = 0; i < sheets.length; i++) {
                if (progressCount) {
                    progressCount.textContent = `${i + 1}/${sheets.length}`;
                }
                if (btnText) {
                    btnText.textContent = 'Descargando...';
                }
    
                const sheet = sheets[i];

                // Ocultar la marca de agua para el PDF
                sheet.querySelectorAll('.j-board-grid').forEach(grid => {
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
    
                // Volver a mostrar la marca de agua
                sheet.querySelectorAll('.j-board-grid').forEach(grid => {
                    grid.classList.remove('pdf-export');
                });

                sheets.forEach((s) => {
                    s.style.display = '';
                });
    
                await new Promise(resolve => setTimeout(resolve, 200));
    
                if (progressCount) {
                    progressCount.textContent = `${i + 1}/${sheets.length} ✅`;
                }
            }
    
            const nombreArchivo = `loteria-la-dama-${Date.now()}.pdf`;
            
            if (btnText) btnText.textContent = 'Descargando...';            
            pdf.save(nombreArchivo);
    
            // ✅ LIMPIAR SESSION STORAGE
            sessionStorage.removeItem('juguemos_payment_verified');
            sessionStorage.removeItem('juguemos_payment_token');
            sessionStorage.removeItem('juguemos_page_loaded');
            sessionStorage.removeItem('juguemos_order_id');
    
            // ✅ MOSTRAR MENSAJE DE ÉXITO
            if (btnText) btnText.textContent = '✅ PDF descargado!';
    
            // ✅ REDIRIGIR DESPUÉS DE 2 SEGUNDOS
            setTimeout(function() {
                window.location.href = '/juguemos';
            }, 2000);
    
        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        } finally {
            // ✅ RESTAURAR BOTÓN
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
