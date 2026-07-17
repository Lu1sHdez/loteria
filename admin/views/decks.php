<?php

if (!defined('ABSPATH')) {
    exit;
}

$categorias = Juguemos_Admin_Categorias::get_all();

$categoria_actual = $categorias[0]->id ?? 0;

$designs = [];

if ($categoria_actual) {
    $designs = Juguemos_Admin_Designs::get_by_category($categoria_actual);
}
?>

<div class="titulo-seccion-contenedor">
    <img class="destello" src="/wp-content/uploads/2026/07/Destello1.png" alt="">

    <h2 class="titulo-seccion">TUS DISEÑOS DE LOTERÍA</h2>

    <img class="destello" src="/wp-content/uploads/2026/07/Destello2.png" alt="">
</div>

<div class="j-admin-filtros-wrapper">

    <div class="j-admin-filtros">

        <div class="j-admin-categorias">

            <?php foreach ($categorias as $index => $categoria): ?>

                <button
                    type="button"
                    data-id="<?php echo esc_attr($categoria->id); ?>"
                    class="j-admin-categoria <?php echo $index === 0 ? 'active' : ''; ?>">

                    <?php echo esc_html($categoria->nombre); ?>

                </button>

            <?php endforeach; ?>

        </div>

        <a
            href="?view=create-design"
            class="j-admin-add">
            + Agregar Nuevo Diseño
        </a>

    </div>

</div>

<div 
    id="j-admin-designs" 
    class="j-admin-designs-grid">

    <?php if (empty($designs)): ?>

        <p>No hay diseños registrados.</p>

    <?php else: ?>

        <?php foreach ($designs as $design): ?>

            <div class="j-admin-design-card">

                <img
                    src="<?php echo esc_url($design->portada); ?>"
                    alt="<?php echo esc_attr($design->nombre); ?>">
                <p>
                    <?php echo esc_html($design->nombre); ?>
                </p>

                <a href="#" class="j-admin-edit">
                    Editar
                </a>

            </div>

        <?php endforeach; ?>

    <?php endif; ?>

</div>
<script>

document.addEventListener('DOMContentLoaded', function () {

    const botones = document.querySelectorAll('.j-admin-categoria');

    const grid = document.getElementById('j-admin-designs');

    botones.forEach(function (boton) {

        boton.addEventListener('click', function () {

            botones.forEach(function (btn) {
                btn.classList.remove('active');
            });

            boton.classList.add('active');

            const categoria = boton.dataset.id;

            fetch(
                '<?php echo admin_url("admin-ajax.php"); ?>?action=juguemos_admin_designs&categoria_id=' + categoria
            )

            .then(res => res.json())

            .then(response => {

                if(response.success){

                    grid.innerHTML = response.data;

                }

            });

        });

    });

});

</script>