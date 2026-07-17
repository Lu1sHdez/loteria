
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

    <div id="j-toast" class="j-toast">
        Categoría creada correctamente.
    </div>

    <div
        id="j-category-modal"
            class="j-modal">

            <div class="j-modal-box">


                <div class="j-panel-item">
                    <div class="subtitulo-aqua">
                        Nueva Categoría
                    </div>
                </div>

                <input
                    type="text"
                    id="j-category-name"
                    placeholder="Nombre de la categoría">

                <div class="j-modal-actions">

                    <button
                        type="button"
                        id="j-save-category"
                        class="j-modal-save">

                        Guardar

                    </button>

                    <button
                        type="button"
                        id="j-close-category"
                        class="j-modal-cancel">

                        Cancelar

                    </button>

                </div>

            </div>

    </div>
    <div id="j-manage-modal" class="j-modal">

    <div class="j-modal-box j-manage-box">

        <div class="j-panel-item">
            <div class="subtitulo-aqua">
                Administrar Categorías
            </div>
        </div>

        <div class="j-category-list">

            <?php foreach($categorias as $categoria): ?>

                <div
                    class="j-category-item"
                    data-id="<?php echo $categoria->id; ?>">

                    <span class="j-category-name">
                        <?php echo esc_html($categoria->nombre); ?>
                    </span>

                    <button
                        type="button"
                        class="j-delete-category"
                        data-id="<?php echo $categoria->id; ?>">
                        Eliminar
                    </button>

                </div>

            <?php endforeach; ?>

        </div>

        <div class="j-modal-actions">

            <button
                type="button"
                id="j-close-manage"
                class="j-modal-cancel">
                Cerrar
            </button>

        </div>

    </div>

</div>                 
    
</div>

<script>

document.addEventListener('DOMContentLoaded',function(){

    const modal=document.getElementById('j-category-modal');

    document.getElementById('j-open-category').onclick=function(){

        modal.classList.add('show');

    };

    document.getElementById('j-close-category').onclick=function(){

        modal.classList.remove('show');

    };

    document.getElementById('j-save-category').onclick=function(){

        const nombre=document.getElementById('j-category-name').value;

        if(!nombre.trim()){

            return;

        }

        const data=new FormData();

        data.append('action','juguemos_create_category');

        data.append('nombre',nombre);

        data.append(
            'nonce',
            '<?php echo wp_create_nonce("juguemos_admin_category"); ?>'
        );

        fetch('<?php echo admin_url("admin-ajax.php"); ?>',{

            method:'POST',

            body:data

        })

        .then(r=>r.json())

        .then(r=>{

            if(r.success){

                const option=document.createElement('option');

                option.value=r.data.id;

                option.textContent=r.data.nombre;

                option.selected=true;

                document
                .getElementById('categoria_id')
                .appendChild(option);

                document.getElementById('j-category-name').value='';

                modal.classList.remove('show');

                const toast = document.getElementById('j-toast');

                toast.classList.add('show');

                setTimeout(function(){

                    toast.classList.remove('show');

                },2500);

            }
            

        });

    };

});
const manage=document.getElementById('j-manage-modal');

document.getElementById('j-open-manage').onclick=function(){

    manage.classList.add('show');

};

document.getElementById('j-close-manage').onclick=function(){

    manage.classList.remove('show');

};

document.querySelectorAll('.j-delete-category').forEach(function(btn){

btn.onclick=function(){

    if(!confirm('¿Eliminar esta categoría?')){
        return;
    }

    const data=new FormData();

    data.append(
        'action',
        'juguemos_delete_category'
    );

    data.append(
        'id',
        this.dataset.id
    );

    data.append(
        'nonce',
        '<?php echo wp_create_nonce("juguemos_admin_category"); ?>'
    );

    fetch('<?php echo admin_url("admin-ajax.php"); ?>',{

        method:'POST',

        body:data

    })

    .then(r=>r.json())

    .then(r=>{

        if(r.success){

            this.closest('.j-category-item').remove();

        }

    });

};

});

</script>