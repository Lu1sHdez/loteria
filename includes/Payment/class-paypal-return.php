<?php

if (!defined('ABSPATH')) {
    exit;
}

class Juguemos_PayPal_Return
{

    public function __construct()
    {
        add_action(
            'init',
            [$this, 'listen']
        );
    }

    public function listen()
    {

        if (
            empty($_GET['payment']) ||
            $_GET['payment'] !== 'success'
        ) {
            return;
        }

        if (empty($_GET['token'])) {
            wp_die('Token inválido.');
        }

        $token = sanitize_text_field($_GET['token']);

        $handler = new Juguemos_PayPal_Handler();

        $result = $handler->capture_order($token);

        if (!$result) {
            wp_die('No fue posible confirmar el pago.');
        }

        set_transient(
            'juguemos_paid_' . $token,
            true,
            HOUR_IN_SECONDS
        );

        ?>
        <!doctype html>
        <html>
        <body>

        <script>

        if(window.opener){

            window.opener.postMessage({

                type:"paypal_payment_completed",

                token:"<?php echo esc_js($token); ?>"

            },"*");

        }

        window.close();

        </script>

        Pago confirmado.

        </body>
        </html>

        <?php

        exit;

    }

}