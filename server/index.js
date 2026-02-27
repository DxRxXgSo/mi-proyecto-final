const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const cloudinary = require('cloudinary').v2; 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; 

// --- 1. CONFIGURACIÓN DE CORS ---
// Permite que tu local y tu sitio en Vercel se comuniquen con la API
const allowedOrigins = [
  'http://localhost:5173', 
  'https://mi-proyecto-final-ashy.vercel.app' 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// --- 2. CONFIGURACIÓN DE POSTGRESQL (Base de datos en Render) ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false } // Obligatorio para Render
});

pool.connect()
  .then(() => console.log('✅ Conectado exitosamente a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));


// --- 3. CONFIGURACIÓN DE CLOUDINARY (Galería) ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ==========================================
// 4. RUTAS PARA LA VISTA "HOME" (VISITANTES)
// ==========================================

// Obtener los últimos 10 visitantes para mostrar en la parte inferior de la Home
app.get('/api/visitantes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM visitantes_home ORDER BY fecha_visita DESC LIMIT 10');
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener visitantes:', error);
    res.status(500).json({ error: 'Error al consultar visitantes' });
  }
});

// Guardar nuevo visitante
app.post('/api/visitantes', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });
  try {
    await pool.query('INSERT INTO visitantes_home (nombre) VALUES ($1)', [nombre]);
    res.status(201).json({ mensaje: 'Visitante guardado' });
  } catch (error) {
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});

// ==========================================
// 5. RUTAS PARA LA VISTA "GALERÍA"
// ==========================================

app.get('/api/imagenes', async (req, res) => {
  try {
    const result = await pool.query('SELECT public_id FROM imagenes_galeria ORDER BY fecha_subida DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al consultar imágenes' });
  }
});

app.post('/api/imagenes', async (req, res) => {
  const { public_id } = req.body;
  if (!public_id) return res.status(400).json({ error: 'El public_id es obligatorio' });
  try {
    await pool.query('INSERT INTO imagenes_galeria (public_id) VALUES ($1)', [public_id]);
    res.status(201).json({ mensaje: 'Imagen vinculada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al insertar imagen' });
  }
});

app.delete('/api/imagenes', async (req, res) => {
  const { public_id } = req.query; 
  if (!public_id) return res.status(400).json({ error: 'Falta public_id' });
  try {
    await cloudinary.uploader.destroy(public_id);
    await pool.query('DELETE FROM imagenes_galeria WHERE public_id = $1', [public_id]);
    res.status(200).json({ mensaje: 'Imagen eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

// ==========================================
// 6. CRUD: RUTAS PARA "CONTACTOS" (CON BYPASS)
// ==========================================

app.post('/api/contacto', async (req, res) => {
  const { nombre, email, telefono, fecha_nacimiento, mensaje, captchaToken } = req.body;
  
  if (!captchaToken) return res.status(400).json({ error: 'Captcha requerido' });

  try {
    let esValido = false;

    // --- LÓGICA DE SALTO (BYPASS): Si el token es ADMIN_BYPASS, no validamos con Google ---
    if (captchaToken === 'ADMIN_BYPASS') {
      esValido = true; 
    } else {
      const secretKey = process.env.RECAPTCHA_SECRET_KEY; 
      const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
      const googleResponse = await fetch(verifyUrl, { method: 'POST' });
      const googleData = await googleResponse.json();
      esValido = googleData.success;
    }

    if (esValido) {
      const query = `INSERT INTO contactos (nombre, email, telefono, fecha_nacimiento, mensaje) VALUES ($1, $2, $3, $4, $5)`;
      await pool.query(query, [nombre, email, telefono, fecha_nacimiento, mensaje]);
      res.status(200).json({ mensaje: 'Contacto guardado con éxito' });
    } else {
      res.status(400).json({ error: 'Validación de Captcha fallida' });
    }
  } catch (error) {
    console.error('Error en contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/contacto', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

app.put('/api/contacto/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, fecha_nacimiento, mensaje } = req.body;
  try {
    const query = `UPDATE contactos SET nombre = $1, email = $2, telefono = $3, fecha_nacimiento = $4, mensaje = $5 WHERE id = $6`;
    await pool.query(query, [nombre, email, telefono, fecha_nacimiento, mensaje, id]);
    res.status(200).json({ mensaje: 'Actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar' });
  }
});

app.delete('/api/contacto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
    res.status(200).json({ mensaje: 'Eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
});

app.get('/', (req, res) => {
  res.status(200).send('🚀 API Funcionando');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});