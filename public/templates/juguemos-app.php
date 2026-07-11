<?php
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="juguemos-app">

    <?php
        include JUGUEMOS_PATH . 'public/templates/wizard/header.php';

        include JUGUEMOS_PATH . 'public/templates/wizard/step-design.php';

        include JUGUEMOS_PATH . 'public/templates/wizard/step-preview.php';

        include JUGUEMOS_PATH . 'public/templates/wizard/step-payment.php';
    ?>

</div>