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


    /**
     * Guarda una imagen preview dentro del diseño.
     */
    public static function upload_preview($design_id, $file, $filename = null)
    {
        if (empty($file['tmp_name']) || !file_exists($file['tmp_name'])) {
            return new WP_Error(
                'file_not_found',
                'Archivo no encontrado.'
            );
        }

        self::create_design_directory($design_id);

        $extension = strtolower(
            pathinfo($file['name'], PATHINFO_EXTENSION)
        );

        if ($extension !== 'webp') {
            return new WP_Error(
                'invalid_extension',
                'Solo se permiten imágenes WebP.'
            );
        }

        if ($filename === null) {
            $filename = sanitize_file_name($file['name']);
        }

        $destination = self::preview_path($design_id) . $filename;

        if (!move_uploaded_file($file['tmp_name'], $destination)) {
            return new WP_Error(
                'upload_error',
                'No fue posible guardar la imagen.'
            );
        }

        return $filename;
    }
    /**
     * Elimina una imagen preview.
     */
    public static function delete_preview($design_id, $filename)
    {
        $file = self::preview_path($design_id) . $filename;

        if (file_exists($file)) {
            unlink($file);
        }

        return true;
    }

    /**
     * Elimina completamente la carpeta del diseño.
     */
    public static function delete_design_directory($design_id)
    {
        $directory = self::design_path($design_id);

        if (!is_dir($directory)) {
            return;
        }

        $iterator = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator(
                $directory,
                RecursiveDirectoryIterator::SKIP_DOTS
            ),
            RecursiveIteratorIterator::CHILD_FIRST
        );

        foreach ($iterator as $item) {

            if ($item->isDir()) {
                rmdir($item->getPathname());
            } else {
                unlink($item->getPathname());
            }

        }

        rmdir($directory);
    }
}