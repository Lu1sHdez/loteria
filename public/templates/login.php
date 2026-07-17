<?php

if (!defined('ABSPATH')) {
    exit;
}

if (is_user_logged_in()) {
    ?>
    <script>
        window.location.href = "<?php echo esc_url(home_url('/mi-cuenta')); ?>";
    </script>
    <?php
    exit;
}

// Obtenemos el error directamente de la clase sin usar $_GET ni URLs
$error_message = '';
if (class_exists('Juguemos_Login') && !empty(Juguemos_Login::$login_error)) {
    $error_message = Juguemos_Login::$login_error;
}
?>

<div class="j-login">

    <form method="POST" autocomplete="off">

        <div class="j-field">
            <label for="email">
                Correo electrónico
            </label>
            <input
                id="email"
                type="email"
                name="email"
                placeholder="ejemplo@correo.com"
                value="<?php echo isset($_POST['email']) ? esc_attr($_POST['email']) : ''; ?>"
                >
        </div>

        <div class="j-field" style="margin-bottom: 15px;">
            <label for="password">
                Contraseña
            </label>
            <input
                id="password"
                type="password"
                name="password"
                placeholder="********************"
                >
        </div>

        <!-- Mensaje de error (Texto rojo simple, estilizado por CSS externo) -->
        <?php if (!empty($error_message)) : ?>
            <div class="j-login-error">
                <?php echo esc_html($error_message); ?>
            </div>
        <?php endif; ?>

        <div class="j-forgot" style="margin-bottom: 15px;">
            <a href="<?php echo esc_url(wp_lostpassword_url()); ?>">
                ¿Olvidaste tu contraseña?
            </a>
        </div>

        <button
            type="submit"
            name="juguemos_login"
            class="j-login-button"
            >

            Ingresar

        </button>

    </form>

</div>