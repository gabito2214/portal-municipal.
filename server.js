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
    params: {
        folder: 'municipal_portal',
        allowed_formats: ['pdf', 'doc', 'docx', 'jpg', 'png'],
        resource_type: 'auto'
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
        const query = `INSERT INTO uploads (name, email, filename) VALUES ($1, $2, $3)`;
        await pool.query(query, [name, email, filename]);
        res.json({ success: true, message: '¡CV subido a la nube correctamente!' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
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


