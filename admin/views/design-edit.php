<?php

if (!defined('ABSPATH')) {
    exit;
}

$id = intval($_GET['id'] ?? 0);

if (!$id) {
    echo '<p>Diseño no encontrado.</p>';
    return;
}

$design = Juguemos_Admin_Designs::get($id);

if (!$design) {
    echo '<p>Diseño no encontrado.</p>';
    return;
}

if (isset($_POST['actualizar_design'])) {

    check_admin_referer('juguemos_update_design');

    Juguemos_Admin_Designs::update(

        $design->id,

        [

            'nombre' => $_POST['nombre'],
            'categoria_id' => $_POST['categoria_id']

        ]

    );

    ?>
    <script>
    
    window.location.href = "?page=juguemos-dashboard&view=edit-design&id=<?php echo $design->id; ?>";
    
    </script>
    <?php
    exit;
}

$categorias = Juguemos_Admin_Categorias::get_all();

?>

<div class="titulo-seccion-contenedor">

    <img
        class="destello"
        src="/wp-content/uploads/2026/07/Destello1.png"
        alt="">

    <h2 class="titulo-seccion">

        <?php echo esc_html($design->nombre); ?>

    </h2>

    <img
        class="destello"
        src="/wp-content/uploads/2026/07/Destello2.png"
        alt="">

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

                1. Nombre del Diseño

            </div>

        </div>

        <form method="post">

            <?php wp_nonce_field('juguemos_update_design'); ?>

            <input
                type="hidden"
                name="design_id"
                value="<?php echo esc_attr($design->id); ?>">

            <div class="j-admin-field">

                <label>Nombre del Diseño</label>

                <input
                    type="text"
                    name="nombre"
                    value="<?php echo esc_attr($design->nombre); ?>"
                    required>

            </div>

            <div class="j-admin-field">

                <label>Categoría</label>

                <div class="j-admin-category-row">

                    <select
                        id="categoria_id"
                        name="categoria_id"
                        required>

                        <?php foreach ($categorias as $categoria): ?>

                            <option
                                value="<?php echo $categoria->id; ?>"
                                <?php selected($design->categoria_id, $categoria->id); ?>>

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
                name="actualizar_design">

                Actualizar Diseño

            </button>

        </form>

    </div>

</div>

<div class="j-panel-item" style="margin-top:60px;">

    <div class="subtitulo-aqua">

        2. Casillas y Barajas Personalizadas

    </div>

</div>

<div class="j-admin-design-cards">

    <p style="padding:40px;text-align:center;color:#777;">

        Aquí aparecerán todas las casillas y barajas del diseño.

    </p>

</div>

<?php
include JUGUEMOS_PATH . 'admin/views/category-modals.php';
?>