<?php

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

$decks = $wpdb->get_results("
    SELECT id,nombre
    FROM {$wpdb->prefix}juguemos_decks
    ORDER BY nombre
");

?>

<div class="wrap">

    <h1>Cartas de Barajas</h1>

    <form method="get">

        <input type="hidden" name="page" value="juguemos-cards">

        <table class="form-table">

            <tr>

                <th>Baraja</th>

                <td>

                    <select name="deck_id">

                        <option value="">
                            Selecciona una baraja
                        </option>

                        <?php foreach($decks as $deck): ?>

                            <option
                                value="<?php echo $deck->id; ?>"
                                <?php selected(
                                    $_GET['deck_id'] ?? '',
                                    $deck->id
                                ); ?>
                            >

                                <?php echo esc_html($deck->nombre); ?>

                            </option>

                        <?php endforeach; ?>

                    </select>

                </td>

            </tr>

        </table>

        <?php submit_button('Cargar cartas'); ?>


        

    </form>

    <?php

if (!empty($_GET['deck_id'])) {

    $deck = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}juguemos_decks WHERE id=%d",
            intval($_GET['deck_id'])
        )
    );

    if ($deck) {

        $cards = $wpdb->get_results("
            SELECT id,nombre
            FROM {$wpdb->prefix}juguemos_cards
            ORDER BY id"
        );

        // Carpeta física donde están las imágenes
        $base_path = WP_CONTENT_DIR .
            '/juguemos/decks/' .
            sanitize_title($deck->nombre);

        echo "<hr>";
        echo "<h2>{$deck->nombre}</h2>";

        echo "<table class='widefat striped'>";
        echo "<thead>
                <tr>
                    <th>#</th>
                    <th>Carta</th>
                    <th>Preview</th>
                    <th>Print</th>
                </tr>
              </thead>";
        echo "<tbody>";

        foreach ($cards as $card) {

            $slug = sanitize_title($card->nombre);

            $preview = sprintf(
                "%s/preview/%02d-%s.webp",
                $base_path,
                $card->id,
                $slug
            );

            $print = sprintf(
                "%s/print/%02d-%s.png",
                $base_path,
                $card->id,
                $slug
            );

            echo "<tr>";

            echo "<td>{$card->id}</td>";

            echo "<td>{$card->nombre}</td>";

            echo "<td>";

            if (file_exists($preview)) {

                echo "Ok";

            } else {

                echo "Error";

            }

            echo "</td>";

            echo "<td>";

            if (file_exists($print)) {

                echo "Ok";

            } else {

                echo "Error";

            }

            echo "</td>";

            echo "</tr>";

        }

        echo "</tbody>";
        echo "</table>";

    }

}
?>

</div>