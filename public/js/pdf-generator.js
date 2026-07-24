/**
 * =====================================================
 * JUGUEMOS PDF GENERATOR
 * Captura el preview ya renderizado por PrintPaper
 * (con diseño, colores, marcas de corte, etc. ya
 * aplicados) y lo exporta como PDF respetando el
 * tamaño de papel y orientación configurados.
 * =====================================================
 */

window.JuguemosPDF = {

    // Escala de captura (más alto = mejor calidad, más lento/pesado)
    captureScale: 2,

    /**
     * Espera a que todas las imágenes dentro de un contenedor
     * terminen de cargar antes de capturar (evita cartas en blanco)
     */
    esperarImagenes(container) {
        const imgs = Array.from(container.querySelectorAll('img'));
        const promesas = imgs.map(img => {
            if (img.complete && img.naturalWidth !== 0) {
                return Promise.resolve();
            }
            return new Promise(resolve => {
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
            });
        });
        return Promise.all(promesas);
    },

    /**
     * Genera y descarga el PDF con el diseño actual
     */
    async generate() {
        const btn = document.getElementById('j-download-pdf');
        const btnText = document.getElementById('j-pdf-btn-text');
        const progress = document.getElementById('j-pdf-progress');
        const progressCount = document.getElementById('j-pdf-progress-count');

        if (typeof window.jspdf === 'undefined' || typeof html2canvas === 'undefined') {
            alert('No se pudieron cargar las librerías de PDF. Revisa tu conexión.');
            return;
        }

        if (typeof JuguemosState === 'undefined' || typeof PrintPaper === 'undefined') {
            alert('No se pudo acceder a la configuración de la lotería.');
            return;
        }

        const { jsPDF } = window.jspdf;

        // -----------------------------------------------------------
        // FIX: al llegar al paso 4, el paso 3 (#juguemos-preview-completo)
        // queda con display:none (perdió la clase .active). html2canvas
        // no puede capturar contenido de un elemento oculto: el canvas
        // sale vacío y el PDF descarga en blanco.
        //
        // Solución: mostrar temporalmente ese paso, pero posicionado
        // fuera de la pantalla para que el usuario no vea el flash,
        // capturar, y luego restaurar el estado original.
        // -----------------------------------------------------------
        const stepPreview = document.getElementById('juguemos-preview-completo');
        let stepWasHidden = false;

        if (stepPreview && !stepPreview.classList.contains('active')) {
            stepWasHidden = true;
            stepPreview.classList.add('active'); // aplica display:block (CSS .j-step.active)
            stepPreview.style.position = 'fixed';
            stepPreview.style.top = '0';
            stepPreview.style.left = '-99999px';
            stepPreview.style.zIndex = '-1';
            stepPreview.style.width = '100%';
        }

        // IMPORTANTE: forzar un render con el estado actual antes de capturar,
        // para que el PDF refleje exactamente la última configuración
        // (diseño, colores, cantidad de tablas, grid, marcas de corte, etc.)
        PrintPaper.render();

        // Esperar un tick para que el DOM termine de pintarse
        await new Promise(resolve => setTimeout(resolve, 150));

        const container = document.getElementById('j-print-preview');
        const sheets = container ? Array.from(container.querySelectorAll('.j-sheet')) : [];

        if (sheets.length === 0) {
            alert('No hay vista previa generada. Ve al paso 3 y configura tu lotería.');
            this.restoreStep(stepPreview, stepWasHidden);
            return;
        }

        // UI de carga
        if (btn) btn.disabled = true;
        if (btnText) btnText.textContent = 'Preparando...';
        if (progress) progress.style.display = 'block';

        // Configuración real de papel (mm), respetando orientación elegida
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
                    btnText.textContent = `Generando ${i + 1}/${sheets.length}...`;
                }

                const sheet = sheets[i];

                // Esperar a que las imágenes de barajas de ESTA hoja carguen
                await this.esperarImagenes(sheet);

                // Capturar la hoja tal cual se ve: diseño, colores de marco,
                // fondo de tabla, marcas de corte (ya son elementos del DOM)
                const canvas = await html2canvas(sheet, {
                    scale: this.captureScale,
                    useCORS: true,
                    allowTaint: false,
                    backgroundColor: '#FFFFFF',
                    logging: false
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);

                if (i > 0) {
                    pdf.addPage([paperConfig.width, paperConfig.height], orientation);
                }

                // La imagen capturada ocupa toda la hoja del PDF (0,0 -> ancho/alto en mm)
                pdf.addImage(
                    imgData,
                    'JPEG',
                    0,
                    0,
                    paperConfig.width,
                    paperConfig.height
                );
            }

            const nombreArchivo = `loteria-la-dama-${Date.now()}.pdf`;
            pdf.save(nombreArchivo);

        } catch (error) {
            console.error('Error generando PDF:', error);
            alert('Ocurrió un error al generar el PDF. Revisa la consola para más detalles.');
        } finally {
            if (btn) btn.disabled = false;
            if (btnText) btnText.textContent = 'Descargar PDF';
            if (progress) progress.style.display = 'none';
            this.restoreStep(stepPreview, stepWasHidden);
        }
    },

    /**
     * Revierte el paso 3 a su estado oculto original después de capturarlo
     */
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

document.addEventListener('DOMContentLoaded', () => {
    const btnDownload = document.getElementById('j-download-pdf');
    if (btnDownload) {
        btnDownload.addEventListener('click', () => {
            JuguemosPDF.generate();
        });
    }
});