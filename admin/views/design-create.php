
<?php

if (!defined('ABSPATH')) {
    exit;
}

$categorias = Juguemos_Admin_Categorias::get_all();
if(

    isset($_POST['guardar_design'])

){

    check_admin_referer(
        'juguemos_create_design'
    );

    Juguemos_Admin_Designs::create($_POST);

    ?>

    <script>

    window.location.href='?';

    </script>

    <?php

    exit;

}

?>

<div class="titulo-seccion-contenedor">
    <img class="destello" src="/wp-content/uploads/2026/07/Destello1.png" alt="">

    <h2 class="titulo-seccion">AGREGAR NUEVO DISEÑO</h2>

    <img class="destello" src="/wp-content/uploads/2026/07/Destello2.png" alt="">
</div>

<div class="j-admin-filtros-wrapper">

    <div class="j-admin-create">

            <div class="j-admin-create-header">

                <a
                    href="?view=list"
                    class="j-admin-back">

                    ← Regresar

                </a>

        

            </div>
            <div class="j-panel-item">
                <div class="subtitulo-aqua">
                    Agregar Nuevo Diseño
                </div>
            </div>

        <form method="post">

            <?php wp_nonce_field('juguemos_create_design'); ?>

            <div class="j-admin-field">

                <label>Nombre del Diseño</label>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Escribe el nombre de la categoría"
                    required>

            </div>

            <div class="j-admin-field">

                <label>Categoría</label>

                <div class="j-admin-category-row">

                    <select
                        id="categoria_id"
                        name="categoria_id"
                        required>

                        <?php foreach($categorias as $categoria): ?>

                            <option value="<?php echo $categoria->id; ?>">

                                <?php echo esc_html($categoria->nombre); ?>

                            </option>

                        <?php endforeach; ?>

                    </select>

                    <button
                        type="button"
                        id="j-open-category"
                        class="j-btn-admin add">
                        + Agregar Categoría
                    </button>
                    <button
                        type="button"
                        id="j-open-manage"
                        class="j-btn-admin manage">
                        ⚙ Administrar
                    </button>

                </div>

            </div>

            <button
                class="j-admin-save"
                type="submit"
                name="guardar_design">

                Guardar Diseño

            </button>

        </form>

    </div>

</div>

<?php
include JUGUEMOS_PATH . 'admin/views/category-modals.php';
?>