<?php

if (!defined('ABSPATH')) {
    exit;
}

$view = $_GET['view'] ?? 'list';

?>

<div class="j-admin-dashboard">

<?php

switch ($view) {

    case 'create-design':

        include JUGUEMOS_PATH.'admin/views/design-create.php';

    break;

    case 'edit-design':

        include JUGUEMOS_PATH.'admin/views/design-edit.php';

    break;

    default:

        include JUGUEMOS_PATH.'admin/views/decks.php';

    break;

}

?>

</div>