<?php
if (!defined('ABSPATH')) {
    exit;
}

$marco_colores = [
    '#FA299C', '#FF8A3D', '#FFD93D', '#2ECC71',
    '#1FAFB4', '#3D8BFF', '#8E44AD', '#E74C3C',
    '#C2185B', '#795548', '#9E9E9E', '#000000',
];
?>

<div class="j-color-style">

    <!-- ==========================================
         COLOR DE MARCO Y RELLENO DE BARAJA
         ========================================== -->
    <p class="text-p-personalizada">Color de Marco y Relleno de Baraja</p>

    <div class="j-marco-colores">
        <?php foreach ($marco_colores as $index => $hex): ?>
            <button
                type="button"
                class="j-color-swatch <?php echo $index === 0 ? 'active' : ''; ?>"
                data-color="<?php echo esc_attr($hex); ?>"
                data-target="marco"
                style="background: <?php echo esc_attr($hex); ?>;"
                aria-label="Color marco <?php echo esc_attr($hex); ?>">
            </button>
        <?php endforeach; ?>
    </div>

    <!-- ==========================================
         COLOR FONDO DE TABLA (MISMA PALETA DE 12)
         ========================================== -->
    <p class="text-p-personalizada">Color fondo de tabla</p>

    <div class="j-fondo-colores">
        <?php foreach ($marco_colores as $index => $hex): ?>
            <button
                type="button"
                class="j-fondo-swatch <?php echo $index === 0 ? 'active' : ''; ?>"
                data-color="<?php echo esc_attr($hex); ?>"
                data-target="fondo"
                style="background: <?php echo esc_attr($hex); ?>; border: 3px solid <?php echo esc_attr($hex); ?>;"
                aria-label="Color fondo <?php echo esc_attr($hex); ?>">
            </button>
        <?php endforeach; ?>
    </div>



</div>
