<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Files
{
    /**
     * Ruta base donde se almacenan los archivos del plugin.
     */
    public static function base_path()
    {
        $upload = wp_upload_dir();

        return trailingslashit($upload['basedir']) . 'juguemos/';
    }

    /**
     * URL base de los archivos.
     */
    public static function base_url()
    {
        $upload = wp_upload_dir();

        return trailingslashit($upload['baseurl']) . 'juguemos/';
    }

    /**
     * Carpeta del diseño.
     */
    public static function design_path($design_id)
    {
        return self::base_path() . 'designs/' . intval($design_id) . '/';
    }

    /**
     * Carpeta preview del diseño.
     */
    public static function preview_path($design_id)
    {
        return self::design_path($design_id) . 'preview/';
    }

    /**
     * URL preview.
     */
    public static function preview_url($design_id)
    {
        return self::base_url() . 'designs/' . intval($design_id) . '/preview/';
    }

    /**
     * Crea las carpetas necesarias para un diseño.
     */
    public static function create_design_directory($design_id)
    {
        $preview = self::preview_path($design_id);

        if (!file_exists($preview)) {
            wp_mkdir_p($preview);
        }

        return $preview;
    }
}