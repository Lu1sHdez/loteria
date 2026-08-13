<?php

if (!defined('ABSPATH')) {
    exit;
}

$uploads = wp_upload_dir();
$pasos_url = $uploads['baseurl'] . '/2026/08';

?>

<div class="juguemos-wizard">

    <!-- PASO 1 -->
    <div class="juguemos-step active" data-step="1">

        <div class="step-icon">
            <img
                class="step-icon-off"
                src="/wp-content/uploads/2026/08/paso_1.png"
                alt=""
            >

            <img
                class="step-icon-on"
                src="/wp-content/uploads/2026/08/baraja-paso1.png"
                alt=""
            >
        </div>

        <div class="step-number">
            1
        </div>

        <div class="step-text">
            <strong>Elige tu Diseño</strong>
        </div>

    </div>


    <div class="juguemos-line"></div>


    <!-- PASO 2 -->
    <div class="juguemos-step" data-step="2">

        <div class="step-icon">
            <img
                class="step-icon-off"
                src="/wp-content/uploads/2026/08/paso_2.png"
                alt=""
            >

            <img
                class="step-icon-on"
                src="/wp-content/uploads/2026/08/baraja-paso2.png"
                alt=""
            >
        </div>

        <div class="step-number">
            2
        </div>

        <div class="step-text">
            <strong>Personaliza</strong>
        </div>

    </div>


    <div class="juguemos-line"></div>


    <!-- PASO 3 -->
    <div class="juguemos-step" data-step="3">

        <div class="step-icon">
            <img
                class="step-icon-off"
                src="/wp-content/uploads/2026/08/paso_3.png"
                alt=""
            >

            <img
                class="step-icon-on"
                src="/wp-content/uploads/2026/08/baraja-paso3.png"
                alt=""
            >
        </div>

        <div class="step-number">
            3
        </div>

        <div class="step-text">
            <strong>Vista Previa</strong>
        </div>

    </div>


    <div class="juguemos-line"></div>


    <!-- PASO 4 -->
    <div class="juguemos-step" data-step="4">

        <div class="step-icon">
            <img
                class="step-icon-off"
                src="/wp-content/uploads/2026/08/paso_4.png"
                alt=""
            >

            <img
                class="step-icon-on"
                src="/wp-content/uploads/2026/08/baraja-paso4.png"
                alt=""
            >
        </div>

        <div class="step-number">
            4
        </div>

        <div class="step-text">
            <strong>Pago y Descarga</strong>
        </div>

    </div>

</div>
