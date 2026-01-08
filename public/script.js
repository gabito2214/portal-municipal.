const dropZone = document.getElementById('dropZone');
const cvInput = document.getElementById('cvInput');
const fileNameDisplay = document.getElementById('fileNameDisplay');
const uploadForm = document.getElementById('uploadForm');
const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const toast = document.getElementById('toast');

// Trigger file input on click
dropZone.addEventListener('click', () => cvInput.click());

// Drag and drop handlers
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        cvInput.files = e.dataTransfer.files;
        updateFileName(e.dataTransfer.files[0].name);
    }
});

// Update display when file selected via input
cvInput.addEventListener('change', () => {
    if (cvInput.files.length) {
        updateFileName(cvInput.files[0].name);
    }
});

function updateFileName(name) {
    fileNameDisplay.innerHTML = `Archivo seleccionado: <strong>${name}</strong>`;
}

// Form Submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!cvInput.files.length) {
        showToast('Por favor selecciona un archivo', true);
        return;
    }

    // UI Feedback: Loading
    submitBtn.disabled = true;
    loader.style.display = 'block';
    submitBtn.querySelector('span').textContent = 'Subiendo...';

    const formData = new FormData(uploadForm);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showToast('¡Éxito! Tu CV ha sido enviado correctamente.');
            uploadForm.reset();
            fileNameDisplay.innerHTML = 'Arrastra tu CV aquí o <span>haz clic para buscar</span>';
        } else {
            showToast('Error: ' + result.message, true);
        }
    } catch (error) {
        showToast('Error de conexión con el servidor', true);
        console.error(error);
    } finally {
        submitBtn.disabled = false;
        loader.style.display = 'none';
        submitBtn.querySelector('span').textContent = 'Enviar Currículum';
    }
});

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}
