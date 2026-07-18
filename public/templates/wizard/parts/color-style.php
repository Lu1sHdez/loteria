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

    <p class="text-p-negrita">Color de marco de baraja</p>

    <div class="j-marco-colores">
        <?php foreach ($marco_colores as $index => $hex): ?>
            <button
                type="button"
                class="j-color-swatch <?php echo $index === 0 ? 'active' : ''; ?>"
                data-color="<?php echo esc_attr($hex); ?>"
                style="background: <?php echo esc_attr($hex); ?>;"
                aria-label="Color <?php echo esc_attr($hex); ?>">
            </button>
        <?php endforeach; ?>
    </div>

    <p class="text-p-negrita j-fondo-title">Color fondo de tabla</p>

    <div class="j-fondo-opciones">

        <label class="j-fondo-card active" data-color="#FFFFFF">
            <input type="radio" name="j-fondo-tabla" value="#FFFFFF" checked>
            <span class="j-fondo-swatch" style="background:#FFFFFF;"></span>
            <span class="j-fondo-info">
                <span class="j-fondo-name">Blanco Clásico ⭐</span>
                <span class="j-fondo-hex">#FFFFFF</span>
            </span>
        </label>

        <label class="j-fondo-card" data-color="#FDF3F7">
            <input type="radio" name="j-fondo-tabla" value="#FDF3F7">
            <span class="j-fondo-swatch" style="background:#FDF3F7;"></span>
            <span class="j-fondo-info">
                <span class="j-fondo-name">Rosa Perla</span>
                <span class="j-fondo-hex">#FDF3F7</span>
            </span>
        </label>

        <label class="j-fondo-card" data-color="#EEF9F8">
            <input type="radio" name="j-fondo-tabla" value="#EEF9F8">
            <span class="j-fondo-swatch" style="background:#EEF9F8;"></span>
            <span class="j-fondo-info">
                <span class="j-fondo-name">Aqua Claro</span>
                <span class="j-fondo-hex">#EEF9F8</span>
            </span>
        </label>

    </div>

</div>