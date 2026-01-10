require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// PostgreSQL Setup
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.warn('⚠️  ADVERTENCIA: DATABASE_URL no está definido. El servidor no podrá guardar datos.');
}

const pool = new Pool({
    connectionString: dbUrl,
    ssl: (dbUrl && !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1')) ? {
        rejectUnauthorized: false
    } : false
});

// Iniciar Tablas si no existen
const initDB = async () => {
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS uploads (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            filename TEXT NOT NULL,
            upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);

        await pool.query(`CREATE TABLE IF NOT EXISTS vacations (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            employee_id TEXT NOT NULL,
            start_date TEXT NOT NULL,
            end_date TEXT NOT NULL,
            status TEXT DEFAULT 'Pendiente',
            request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log('PostgreSQL Tables initialized.');
    } catch (err) {
        console.error('Error initializing DB:', err.message);
    }
};
initDB();

// Cloudinary Storage Config
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Remove extension from original name as Cloudinary adds it based on format
        const rawName = file.originalname.split('.').slice(0, -1).join('.');
        return {
            folder: 'municipal_portal',
            resource_type: 'auto',
            public_id: rawName,
            format: file.originalname.split('.').pop(), // Force original extension
            use_filename: true,
            unique_filename: false
        };
    }
});

cloudinary.api.ping((error, result) => {
    if (error) {
        console.error("❌ CLOUDINARY ERROR:", error);
    } else {
        console.log("✅ Cloudinary connected:", result);
    }
});

const upload = multer({ storage: storage });

// API Endpoints
app.post('/upload', upload.single('cv'), async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email || !req.file) {
        return res.status(400).json({ success: false, message: 'Faltan campos obligatorios' });
    }

    // Cloudinary path is in req.file.path
    const filename = req.file.path;

    try {
        if (!pool) throw new Error("No hay conexión a la base de datos");
        const query = `INSERT INTO uploads (name, email, filename) VALUES ($1, $2, $3)`;
        await pool.query(query, [name, email, filename]);
        res.json({ success: true, message: '¡CV subido a la nube correctamente!' });
    } catch (err) {
        console.error("❌ UPLOAD ERROR FULL DETAILS:", err);
        res.status(500).json({
            success: false,
            message: `Error interno: ${err.message}. Revisa los logs del servidor.`
        });
    }
});

app.post('/vacations', async (req, res) => {
    const { name, employee_id, start_date, end_date } = req.body;
    if (!name || !employee_id || !start_date || !end_date) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    try {
        const query = `INSERT INTO vacations (name, employee_id, start_date, end_date) VALUES ($1, $2, $3, $4)`;
        await pool.query(query, [name, employee_id, start_date, end_date]);
        res.json({ success: true, message: 'Solicitud de vacaciones enviada correctamente!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Admin Endpoints
app.get('/admin/uploads', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM uploads ORDER BY upload_date DESC`);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/admin/vacations', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM vacations ORDER BY request_date DESC`);
        res.json({ success: true, data: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Delete Endpoints
app.delete('/admin/uploads/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Optional: Delete from Cloudinary using public_id if stored, or just DB record
        await pool.query('DELETE FROM uploads WHERE id = $1', [id]);
        res.json({ success: true, message: 'Registro eliminado' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/admin/vacations/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM vacations WHERE id = $1', [id]);
        res.json({ success: true, message: 'Solicitud eliminada' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Export Endpoints (Simple CSV)
app.get('/admin/export/uploads', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM uploads ORDER BY upload_date DESC`);
        const items = result.rows;

        if (!items.length) return res.send("");

        const header = "ID,Fecha,Nombre,Email,Archivo URL\n";
        const rows = items.map(item => {
            return `${item.id},"${item.upload_date}","${item.name}","${item.email}","${item.filename}"`;
        }).join("\n");

        res.header('Content-Type', 'text/csv');
        res.attachment('curriculums.csv');
        res.send(header + rows);
    } catch (err) {
        res.status(500).send("Error exportando datos");
    }
});

app.get('/admin/export/vacations', async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM vacations ORDER BY request_date DESC`);
        const items = result.rows;

        if (!items.length) return res.send("");

        const header = "ID,Fecha Solicitud,Nombre,Legajo,Inicio,Fin,Estado\n";
        const rows = items.map(item => {
            return `${item.id},"${item.request_date}","${item.name}","${item.employee_id}","${item.start_date}","${item.end_date}","${item.status}"`;
        }).join("\n");

        res.header('Content-Type', 'text/csv');
        res.attachment('vacaciones.csv');
        res.send(header + rows);
    } catch (err) {
        res.status(500).send("Error exportando datos");
    }
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running and listening on port ${PORT}`);
    console.log('Ensure Koyeb/Platform health check is directed to this port.');
});


