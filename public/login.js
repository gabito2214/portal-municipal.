document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');

    loginBtn.disabled = true;
    loginBtn.textContent = 'Verificando...';
    errorMsg.style.display = 'none';

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.success) {
            // Success! The server set the cookie, now redirect
            window.location.href = '/panel-admin';
        } else {
            errorMsg.style.display = 'block';
            loginBtn.disabled = false;
            loginBtn.textContent = 'Ingresar al Panel';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMsg.textContent = 'Error de conexión. Intenta más tarde.';
        errorMsg.style.display = 'block';
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar al Panel';
    }
});
