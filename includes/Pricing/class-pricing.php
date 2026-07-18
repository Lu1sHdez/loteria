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
        // Normalizar valores
        $pais_original = $pais; // Guardar el original para la respuesta
        $pais = ucfirst(strtolower($pais));
        $modo = strtolower($modo);
        $cantidad = intval($cantidad);

        if ($cantidad < 1) {
            $cantidad = 1;
        }
        if ($cantidad > 30) {
            $cantidad = 30;
        }

        // Obtener precio unitario
        $precio = self::get_unit_price($pais, $modo);

        if ($precio === null) {
            return [
                'success' => false,
                'message' => 'Precio no encontrado para ' . $pais . ' - ' . $modo
            ];
        }

        $total = $precio * $cantidad;
        
        // 🔥 CORRECCIÓN: Usar strtolower para comparar insensible a mayúsculas
        $moneda = (strtolower($pais) === 'usa') ? 'USD' : 'MXN';

        return [
            'success' => true,
            'pais' => $pais,
            'modo' => $modo,
            'cantidad' => $cantidad,
            'precio_unitario' => round($precio, 2),
            'total' => round($total, 2),
            'moneda' => $moneda
        ];
    }

    /**
     * Obtiene el precio unitario según país y modo
     * Primero intenta desde la base de datos, si no existe usa la tabla por defecto
     *
     * @param string $pais Mexico | USA
     * @param string $modo sencilla | dobles | favoritas | libre
     * @return float|null
     */
    public static function get_unit_price($pais, $modo)
    {
        // Intentar obtener desde la base de datos
        $precio = Juguemos_Price_Repository::get_price($pais, $modo);

        if ($precio !== null && $precio > 0) {
            return floatval($precio);
        }

        // Si no existe en BD, usar la tabla de precios por defecto
        return self::get_default_price($pais, $modo);
    }

    /**
     * Tabla de precios por defecto (hardcoded)
     *
     * @param string $pais Mexico | USA
     * @param string $modo sencilla | dobles | favoritas | libre
     * @return float|null
     */
    public static function get_default_price($pais, $modo)
    {
        $prices = [
            'mexico' => [
                'sencilla'   => 1.25,  // $1.25 pesos por tabla
                'dobles'     => 1.25,  // $1.25 pesos por tabla
                'favoritas'  => 2.00,  // $2.00 pesos por tabla
                'libre'      => 2.50,  // $2.50 pesos por tabla (personalizadas)
            ],
            'usa' => [
                'sencilla'   => 0.30,  // $0.30 USD por tabla
                'dobles'     => 0.30,  // $0.30 USD por tabla
                'favoritas'  => 0.50,  // $0.50 USD por tabla
                'libre'      => 0.50,  // $0.50 USD por tabla (personalizadas)
            ]
        ];

        $pais_key = strtolower($pais);

        // Si el país no existe, usar Mexico por defecto
        if (!isset($prices[$pais_key])) {
            $pais_key = 'mexico';
        }

        // Si el modo no existe, usar sencilla por defecto
        if (!isset($prices[$pais_key][$modo])) {
            $modo = 'sencilla';
        }

        return $prices[$pais_key][$modo];
    }

    /**
     * Obtiene la tabla de precios completa
     *
     * @return array
     */
    public static function get_price_table()
    {
        return [
            'mexico' => [
                'sencilla'   => 1.25,
                'dobles'     => 1.25,
                'favoritas'  => 2.00,
                'libre'      => 2.50,
            ],
            'usa' => [
                'sencilla'   => 0.30,
                'dobles'     => 0.30,
                'favoritas'  => 0.50,
                'libre'      => 0.50,
            ]
        ];
    }

    /**
     * Formatea el precio con la moneda correcta
     *
     * @param float  $price
     * @param string $pais
     * @return string
     */
    public static function format_price($price, $pais)
    {
        // 🔥 CORRECCIÓN: Usar strtolower para comparar insensible a mayúsculas
        $moneda = (strtolower($pais) === 'usa') ? 'USD' : 'MXN';
        $simbolo = '$';
        
        return $simbolo . number_format($price, 2) . ' ' . $moneda;
    }
}