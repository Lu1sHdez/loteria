    <?php
    if (!defined('ABSPATH')) {
        exit;
    }
    ?>

    <section id="juguemos-payment" class="j-step">

        <div class="titulo-seccion-contenedor">
            <h2 class="titulo-seccion">PAGO Y DESCARGA</h2>
        </div>

        <div class="j-step-body">
            <div class="juguemos-left" style="width:100%;">

                <div class="j-section" style="text-align:center;">

                    <p class="text-p-negrita">
                        Vista previa lista. Por el momento puedes descargar el PDF
                        para revisar cómo quedará tu lotería.
                    </p>

                    <button
                        type="button"
                        id="j-download-pdf"
                        class="j-btn-next"
                        style="margin:0 auto;">
                        <span id="j-pdf-btn-text">Descargar PDF</span>
                    </button>

                </div>

            </div>
        </div>
        

        <div class="j-preview-header">
            <button type="button" id="j-back-to-preview" class="j-btn-back">
                <span>←</span>
                <span>Regresar</span>
            </button>
        </div>

        <?php include JUGUEMOS_PATH . 'public/templates/payment/modal-payment.php'; ?>
    </section>