document.addEventListener('DOMContentLoaded', function () {

    const card = document.querySelector('#j-new-baraja');

    if (!card) {
        return;
    }

    const upload = card.querySelector('.j-baraja-upload');
    const input = card.querySelector('.j-baraja-file');
    const preview = card.querySelector('.j-baraja-preview-image');
    const placeholder = card.querySelector('.j-baraja-placeholder');

    upload.addEventListener('click', function () {

        input.click();

    });

    input.addEventListener('change', function () {

        if (!this.files.length) {
            return;
        }

        const file = this.files[0];

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

});