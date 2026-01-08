const dropZone = document.getElementById('dropZone');
const cvInput = document.getElementById('cvInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const uploadForm = document.getElementById('uploadForm');
const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

if (dropZone) {
    dropZone.addEventListener('click', () => cvInput.click());
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            cvInput.files = e.dataTransfer.files;
            updateFileName(e.dataTransfer.files[0].name);
        }
    });
}

if (cvInput) {
    cvInput.addEventListener('change', () => {
        if (cvInput.files.length) updateFileName(cvInput.files[0].name);
    });
}

function updateFileName(name) {
    fileNameDisplay.innerHTML = `Archivo seleccionado: <strong>${name}</strong>`;
}

if (uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!cvInput.files.length) {
            showToast('Por favor selecciona un archivo', true);
            return;
        }
        submitBtn.disabled = true;
        loader.style.display = 'block';
        const formData = new FormData(uploadForm);
        try {
            const response = await fetch('/upload', { method: 'POST', body: formData });

            let result;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                const text = await response.text();
                throw new Error(`Respuesta no válida del servidor: ${response.status}`);
            }

            if (result.success) {
                showToast('¡Éxito! Tu CV ha sido enviado correctamente.');
                uploadForm.reset();
                if (fileNameDisplay) fileNameDisplay.innerHTML = 'Arrastra tu CV aquí o <span>haz clic para buscar</span>';
            } else {
                showToast('Error: ' + result.message, true);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Error: ' + error.message, true);
        } finally {
            submitBtn.disabled = false;
            loader.style.display = 'none';
        }
    });
}

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');
    setTimeout(() => { toast.classList.remove('show'); }, 4000);
}
