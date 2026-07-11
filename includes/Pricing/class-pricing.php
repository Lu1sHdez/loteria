<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_Pricing
{

    /**
     * Calcula el total del pedido.
     *
     * @param string $pais     Mexico | USA
     * @param string $modo     sencilla | dobles | favoritas | libre
     * @param int    $cantidad Número de tablas
     *
     * @return array
     */
    public static function calculate($pais, $modo, $cantidad)
    {

        $cantidad = intval($cantidad);

        if ($cantidad < 1) {
            $cantidad = 1;
        }

        // Obtener precio unitario desde el repositorio
        $precio = Juguemos_Price_Repository::get_price(
            $pais,
            $modo
        );

        if (!$precio) {

            return [
                'success' => false,
                'message' => 'Precio no encontrado.'
            ];

        }

        $subtotal = $precio * $cantidad;

        return [

            'success' => true,

            'pais' => $pais,

            'modo' => $modo,

            'cantidad' => $cantidad,

            'precio_unitario' => round($precio, 2),

            'total' => round($subtotal, 2),

            'moneda' => ($pais === 'USA') ? 'USD' : 'MXN'

        ];

    }

}