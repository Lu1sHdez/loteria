<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Login
{
    // Creamos una propiedad estática para guardar el error temporalmente
    public static $login_error = '';

    public function __construct()
    {
        add_action('init', [$this, 'process_login']);
    }

    public function process_login()
    {
        if (
            $_SERVER['REQUEST_METHOD'] !== 'POST' ||
            !isset($_POST['juguemos_login'])
        ) {
            return;
        }

        $email = sanitize_email($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Si hay campos vacíos, no redireccionamos. Guardamos el error y salimos de la función.
        if (empty($email) || empty($password)) {
            self::$login_error = 'Correo o contraseña incorrectos.';
            return;
        }

        $wp_user = get_user_by('email', $email);

        if (!$wp_user) {
            self::$login_error = 'Correo o contraseña incorrectos.';
            return;
        }

        $credentials = [
            'user_login'    => $wp_user->user_login,
            'user_password' => $password,
            'remember'      => false,
        ];

        $user = wp_signon($credentials, is_ssl());

        if (is_wp_error($user)) {
            self::$login_error = 'Correo o contraseña incorrectos.';
            return;
        }

        // Únicamente redireccionamos si el login es EXITOSO
        wp_safe_redirect(home_url('/mi-cuenta'));
        exit;
    }
}