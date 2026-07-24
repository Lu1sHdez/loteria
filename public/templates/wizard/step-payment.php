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

                <div id="j-pdf-progress" style="display:none; margin-top:12px; color:#5D5D5D;">
                    Generando PDF... <span id="j-pdf-progress-count">0/0</span>
                </div>

            </div>

        </div>
    </div>

</section>