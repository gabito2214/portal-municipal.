async function fetchData() {
    try {
        const [cvReq, vacReq] = await Promise.all([
            fetch('/admin/uploads'),
            fetch('/admin/vacations')
        ]);

        const cvs = await cvReq.json();
        const vacations = await vacReq.json();

        renderCVs(cvs.data);
        renderVacations(vacations.data);
    } catch (error) {
        console.error('Error fetching admin data:', error);
        document.getElementById('cvs-body').innerHTML = `<tr><td colspan="4" style="text-align:center; color: #ef4444;">Error al cargar datos: ${error.message}. Verificá la consola del servidor.</td></tr>`;
    }
}

function renderCVs(data) {
    const body = document.getElementById('cvs-body');
    body.innerHTML = data.map(item => `
        <tr>
            <td>${new Date(item.upload_date).toLocaleDateString()}</td>
            <td>${item.name}</td>
            <td>${item.email}</td>
            <td><a href="${item.filename}" target="_blank" class="action-btn">Ver CV</a></td>
            <td><button onclick="deleteRecord(${item.id}, 'uploads')" class="action-btn" style="background: #ef4444; border-color: #ef4444; color: white;">Eliminar</button></td>
        </tr>
    `).join('');
}

function renderVacations(data) {
    const body = document.getElementById('vacations-body');
    body.innerHTML = data.map(item => `
        <tr>
            <td>${new Date(item.request_date).toLocaleDateString()}</td>
            <td>${item.name}</td>
            <td>${item.employee_id}</td>
            <td>${item.start_date}</td>
            <td>${item.end_date}</td>
            <td><span class="status-badge ${item.status === 'Aprobado' ? 'approved' : 'pending'}">${item.status}</span></td>
            <td class="actions-cell">
                ${item.status !== 'Aprobado' ? `<button onclick="updateStatus(${item.id}, 'Aprobado')" class="action-btn success" title="Aprobar">✓</button>` : ''}
                <button onclick="deleteRecord(${item.id}, 'vacations')" class="action-btn danger" title="Eliminar">🗑</button>
            </td>
        </tr>
    `).join('');
}

function switchTab(tab) {
    const cvsTable = document.getElementById('cvs-table');
    const vacsTable = document.getElementById('vacations-table');
    const btns = document.querySelectorAll('.tab-btn');

    if (tab === 'cvs') {
        cvsTable.style.display = 'block';
        vacsTable.style.display = 'none';
        btns[0].classList.add('active');
        btns[1].classList.remove('active');
    } else {
        cvsTable.style.display = 'none';
        vacsTable.style.display = 'block';
        btns[0].classList.remove('active');
        btns[1].classList.add('active');
    }
}

// Actions
async function deleteRecord(id, type) {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro?')) return;

    try {
        const res = await fetch(`/admin/${type}/${id}`, { method: 'DELETE' });
        const result = await res.json();

        if (result.success) {
            alert('Eliminado correctamente');
            fetchData(); // Reload table
        } else {
            alert('Error al eliminar: ' + result.message);
        }
    } catch (error) {
        console.error(error);
        alert('Error de conexión');
    }
}

function exportData(type) {
    window.location.href = `/admin/export/${type}`;
}

// Status Update
async function updateStatus(id, status) {
    if (!confirm(`¿Cambiar estado a "${status}"?`)) return;

    try {
        const res = await fetch(`/admin/vacations/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        const result = await res.json();

        if (result.success) {
            fetchData(); // Reload
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error de conexión');
    }
}

// Initial fetch
fetchData();
