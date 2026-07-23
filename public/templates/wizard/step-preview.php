<?php
if (!defined('ABSPATH')) {
    exit;
}
?>



<section id="juguemos-preview-completo" class="j-step">
    

    <div class="titulo-seccion-contenedor">

        <img
            class="destello"
            src="/wp-content/uploads/2026/07/Destello1.png"
            alt="">

        <h2 class="titulo-seccion">
            VISTA PREVIA
        </h2>

        <img
            class="destello"
            src="/wp-content/uploads/2026/07/Destello2.png"
            alt="">

    </div>

    <div class="j-step-body">

    <div class="juguemos-left">

        <div class="j-section">

            <div class="j-panel-item">
                <div class="subtitulo-aqua">
                    1. Opciones de Impresión
                </div>
            </div>

            <div class="j-print-options-grid">

                <div class="j-print-option">

                    <p class="text-p-negrita">
                        Tamaño de papel
                    </p>

                    <p class="j-texto-normal">
                        Selecciona el tamaño del papel para la impresión.
                    </p>

                    <div class="j-select-wrapper">

                        <select
                            id="j-paper-size"
                            class="j-select j-select-papel">
                        </select>
                    </div>

                </div>  

                <!-- Orientación -->

                <div class="j-print-option">

                    <p class="text-p-negrita">
                        Orientación
                    </p>

                    <p class="j-texto-normal">
                        Elige la orientación que deseas para tus tablas de lotería.
                    </p>

                    <div class="j-orientation-options">

                        <button
                            type="button"
                            class="j-orientation active"
                            data-orientation="vertical">

                            <div class="j-orientation-icon vertical"></div>

                            <span class="j-orientation-label">
                                Vertical
                            </span>

                        </button>

                        <button
                            type="button"
                            class="j-orientation"
                            data-orientation="horizontal">

                            <div class="j-orientation-icon horizontal"></div>

                            <span class="j-orientation-label">
                                Horizontal
                            </span>

                        </button>

                    </div>

                </div>

                <!-- Cantidad de tablas por hoja -->

                <div class="j-print-option">

                <p class="text-p-negrita">
                    Cantidad de tablas por hoja
                </p>

                <p class="j-texto-normal">
                    Define la cantidad de tablas que querrás por hoja.
                </p>

                <div class="j-tables-per-page-control">

                    <button
                        type="button"
                        class="j-tables-per-page-btn j-tables-per-page-minus">

                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2 6H10"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                    </button>

                    <input
                        id="j-tables-per-page"
                        class="j-tables-per-page-input"
                        type="number"
                        min="1"
                        max="30"
                        value="18">

                    <button
                        type="button"
                        class="j-tables-per-page-btn j-tables-per-page-plus">

                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2 6H10M6 2V10"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                    </button>

                </div>

                </div>

                <!-- Cantidad de páginas -->

                <div class="j-print-option">

                <p class="text-p-negrita">
                    Cantidad de páginas
                </p>

                <p class="j-texto-normal">
                    Define la cantidad de páginas que querrás imprimir.
                </p>

                <div class="j-tables-per-page-control">

                    <button
                        type="button"
                        class="j-tables-per-page-btn j-pages-minus">

                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2 6H10"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                    </button>

                    <input
                        id="j-pages"
                        class="j-tables-per-page-input"
                        type="number"
                        min="1"
                        value="10">

                    <button
                        type="button"
                        class="j-tables-per-page-btn j-pages-plus">

                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path
                                d="M2 6H10M6 2V10"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"/>
                        </svg>

                    </button>

                </div>

                </div>

                <div class="j-print-option">
                <p class="text-p-negrita">
                    Marcas de corte
                </p>
                <p class="j-texto-normal">
                    Activa para mostrar las marcas de corte en la vista previa e impresión.
                </p>

                <div id="j-preview-sheet" class="j-preview-sheet">

                    <span class="j-crop top-left"></span>
                    <span class="j-crop top-right"></span>
                    <span class="j-crop bottom-left"></span>
                    <span class="j-crop bottom-right"></span>

                    <div class="j-preview-grid">

                        <!-- Se llenará por JS -->

                    </div>

                </div>

                <label class="j-switch">

                    <input
                        id="j-cut-marks"
                        type="checkbox"
                        checked>

                    <span class="j-switch-slider"></span>

                </label>

            </div>

            </div>

        </div>
        <div class="j-preview-header">
            <button
                type="button"
                id="j-edit-order"
                class="j-btn-back">
                <span>←</span>
                <span>Editar pedido</span>
            </button>
        </div>

    </div>

</div>

</section>