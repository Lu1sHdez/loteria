<?php

if (!defined('ABSPATH')) {
    exit;
}

?>

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

<script>

document.addEventListener('DOMContentLoaded', function () {

    const modal = document.getElementById('j-category-modal');
    const manage = document.getElementById('j-manage-modal');

    const openCategory = document.getElementById('j-open-category');
    const closeCategory = document.getElementById('j-close-category');

    const openManage = document.getElementById('j-open-manage');
    const closeManage = document.getElementById('j-close-manage');

    if(openCategory){

        openCategory.onclick = function(){

            modal.classList.add('show');

        };

    }

    if(closeCategory){

        closeCategory.onclick = function(){

            modal.classList.remove('show');

        };

    }

    if(openManage){

        openManage.onclick = function(){

            manage.classList.add('show');

        };

    }

    if(closeManage){

        closeManage.onclick = function(){

            manage.classList.remove('show');

        };

    }

    const saveCategory = document.getElementById('j-save-category');

    if(saveCategory){

        saveCategory.onclick = function(){

            const nombre = document.getElementById('j-category-name').value;

            if(!nombre.trim()){

                return;

            }

            const data = new FormData();

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

                    const select = document.getElementById('categoria_id');

                    if(select){

                        const option = document.createElement('option');

                        option.value = r.data.id;
                        option.textContent = r.data.nombre;
                        option.selected = true;

                        select.appendChild(option);

                    }

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

    }

    document.querySelectorAll('.j-delete-category').forEach(function(btn){

        btn.onclick=function(){

            if(!confirm('¿Eliminar esta categoría?')){

                return;

            }

            const data = new FormData();

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

});

</script>