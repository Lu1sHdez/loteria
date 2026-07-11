<?php

if (!defined('ABSPATH')) {
    exit;
}

global $wpdb;

$table = $wpdb->prefix . "juguemos_decks";


if(isset($_POST['guardar_deck'])){


    $wpdb->insert(
        $table,
        [

            'nombre' => sanitize_text_field($_POST['nombre']),

            'categoria' => sanitize_text_field($_POST['categoria']),

            'descripcion' => sanitize_textarea_field($_POST['descripcion'])

        ]
    );


    echo "<div class='updated'><p>Baraja guardada</p></div>";

}


$decks = $wpdb->get_results(
    "SELECT * FROM $table ORDER BY id DESC"
);

?>



<div class="wrap">


<h1>🎴 Barajas</h1>


<form method="POST">


<table class="form-table">


<tr>

<th>Nombre</th>

<td>

<input 
type="text" 
name="nombre"
class="regular-text"
required>

</td>

</tr>



<tr>

<th>Categoría</th>


<td>


<select name="categoria">


<option>Animadas</option>

<option>Baby Shower</option>

<option>Cómica</option>

<option>Despedida de soltera</option>

<option>Dulce</option>

<option>Escuela</option>

<option>Elegante</option>

<option>Materiales</option>

<option>Personajes</option>

<option>Transparente</option>


</select>


</td>


</tr>





<tr>


<th>Descripción</th>


<td>

<textarea 
name="descripcion"
class="large-text">

</textarea>

</td>


</tr>



</table>


<button 
class="button button-primary"
name="guardar_deck">

Guardar Baraja

</button>


</form>




<hr>



<h2>Barajas creadas</h2>



<table class="widefat">

<thead>

<tr>

<th>ID</th>

<th>Nombre</th>

<th>Categoría</th>


</tr>

</thead>


<tbody>


<?php foreach($decks as $deck): ?>


<tr>


<td>

<?= $deck->id ?>

</td>


<td>

<?= esc_html($deck->nombre) ?>

</td>



<td>

<?= esc_html($deck->categoria) ?>

</td>



</tr>



<?php endforeach; ?>


</tbody>


</table>


</div>