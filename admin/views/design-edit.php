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

$barajas = Juguemos_Admin_Barajas::get_by_design(
    $design->id
);


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

<div class="j-panel-item" style="margin-top:60px;">

    <div class="subtitulo-aqua">

        2. Casillas y Barajas Personalizadas

    </div>

</div>

<div class="j-admin-design-cards">

    <?php foreach($barajas as $baraja): ?>

        <div
            class="j-baraja-card"
            data-id="<?php echo $baraja->id; ?>">

            <div class="j-baraja-preview j-baraja-upload">
                <input
                    type="file"
                    class="j-baraja-file"
                    accept=".webp,image/webp"
                    hidden>

                <?php if (!empty($baraja->imagen)): ?>

                    <img
                        class="j-baraja-preview-image"
                        src="<?php echo esc_url(
                            Juguemos_Files::preview_url($design->id) . $baraja->imagen
                        ); ?>"
                        alt="<?php echo esc_attr($baraja->nombre); ?>">

                    <div
                        class="j-baraja-placeholder"
                        style="display:none;">

                        + Imagen

                    </div>

                <?php else: ?>

                    <img
                        class="j-baraja-preview-image"
                        style="display:none;"
                        alt="">

                    <div class="j-baraja-placeholder">

                        + Imagen

                    </div>

                <?php endif; ?>

            </div>

            <div class="j-baraja-numero">

                Baraja #<?php echo $baraja->numero; ?>

            </div>

            <input
                type="text"
                class="j-baraja-nombre"
                value="<?php echo esc_attr($baraja->nombre); ?>">

            <button
                class="j-baraja-update"
                data-id="<?php echo $baraja->id; ?>">

                Actualizar

            </button>
            <button
                type="button"
                class="j-baraja-delete"
                data-id="<?php echo $baraja->id; ?>"
                data-nonce="<?php echo wp_create_nonce('juguemos_admin_baraja'); ?>">

                Eliminar

            </button>

        </div>

    <?php endforeach; ?>


    <?php
        $siguiente = Juguemos_Admin_Barajas::get_next_number($design->id);
        ?>

    <div
        id="j-new-baraja"
        class="j-baraja-card j-baraja-new">

        <div class="j-baraja-preview j-baraja-upload">
            <input
                type="file"
                class="j-baraja-file"
                accept=".webp,image/webp"
                hidden>
            <div class="j-baraja-placeholder">
                + Agregar Imagen
            </div>
            <img
                class="j-baraja-preview-image"
                style="display:none;"
                alt="Vista previa">
        </div>

        <div class="j-baraja-numero">
            Baraja #<?php echo $siguiente; ?>
        </div>
        <input
            type="text"
            class="j-baraja-nombre"
            placeholder="Nombre de la carta"
            autocomplete="off">

        <button
            type="button"
            class="j-baraja-create"
            data-design="<?php echo $design->id; ?>"
            data-numero="<?php echo $siguiente; ?>">
            Agregar Baraja
        </button>

    </div>

</div>

<?php
include JUGUEMOS_PATH . 'admin/views/category-modals.php';
?>

<script>
document.addEventListener('DOMContentLoaded', function () {

    // ========== CREAR NUEVA BARAJA ==========
    const card = document.getElementById('j-new-baraja');

    if (card) {
        const upload = card.querySelector('.j-baraja-upload');
        const input = card.querySelector('.j-baraja-file');
        const preview = card.querySelector('.j-baraja-preview-image');
        const placeholder = card.querySelector('.j-baraja-placeholder');
        const createButton = card.querySelector('.j-baraja-create');

        upload.addEventListener('click', function () {
            input.click();
        });

        input.addEventListener('change', function () {
            if (!input.files.length) return;

            const file = input.files[0];

            if (file.type !== 'image/webp') {
                alert('Solo se permiten imágenes WebP.');
                input.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
            };
            reader.readAsDataURL(file);
        });

        createButton.addEventListener('click', function () {
            if (!input.files.length) {
                alert('Selecciona una imagen.');
                return;
            }

            const nombre = card.querySelector('.j-baraja-nombre').value.trim();
            if (nombre === '') {
                alert('Escribe el nombre de la carta.');
                return;
            }

            const formData = new FormData();
            formData.append('action', 'juguemos_create_baraja');
            formData.append('nonce', '<?php echo wp_create_nonce("juguemos_nonce"); ?>');
            formData.append('design_id', this.dataset.design);
            formData.append('numero', this.dataset.numero);
            formData.append('nombre', nombre);
            formData.append('imagen', input.files[0]);

            fetch('<?php echo admin_url("admin-ajax.php"); ?>', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(response => {
                console.log(response);
                if (response.success) {
                    alert('Baraja creada correctamente.');
                    location.reload();
                } else {
                    alert(response.data || 'Error al crear la baraja.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error de conexión.');
            });
        });
    }

    // ========== ACTUALIZAR BARAJA ==========
    document.querySelectorAll('.j-baraja-update').forEach(function(button) {
        button.addEventListener('click', function() {
            const card = this.closest('.j-baraja-card');
            const nombre = card.querySelector('.j-baraja-nombre').value;
            const input = card.querySelector('.j-baraja-file');

            const formData = new FormData();
            formData.append('action', 'juguemos_update_baraja');
            formData.append('nonce', '<?php echo wp_create_nonce("juguemos_nonce"); ?>');
            formData.append('id', this.dataset.id);
            formData.append('nombre', nombre);

            if (input.files.length) {
                formData.append('imagen', input.files[0]);
            }

            fetch('<?php echo admin_url("admin-ajax.php"); ?>', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    alert('Baraja actualizada correctamente.');
                    location.reload();
                } else {
                    alert(response.data || 'Error al actualizar.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error de conexión.');
            });
        });
    });

    // ========== ELIMINAR BARAJA ==========
    document.querySelectorAll('.j-baraja-delete').forEach(function(button) {
        button.addEventListener('click', function() {
            if (!confirm('¿Eliminar esta baraja?')) {
                return;
            }

            const card = this.closest('.j-baraja-card');
            const formData = new FormData();

            formData.append('action', 'juguemos_delete_baraja');
            formData.append('nonce', this.dataset.nonce);
            formData.append('id', this.dataset.id);

            fetch('<?php echo admin_url("admin-ajax.php"); ?>', {
                method: 'POST',
                body: formData
            })
            .then(r => r.json())
            .then(response => {
                if (response.success) {
                    window.location.reload();
                } else {
                    alert(response.data || 'Error al eliminar.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error de conexión.');
            });
        });
    });

});
</script>