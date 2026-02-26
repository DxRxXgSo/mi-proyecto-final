const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); 
const cloudinary = require('cloudinary').v2; 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000; 

app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE POSTGRESQL (Render) ---
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: { rejectUnauthorized: false } 
});

pool.connect()
  .then(() => console.log('✅ Conectado exitosamente a PostgreSQL'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));


// --- CONFIGURACIÓN DE CLOUDINARY ---
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});
console.log('✅ Cloudinary configurado correctamente');


// ==========================================
// 1. RUTA PARA LA VISTA "HOME"
// ==========================================
app.post('/api/visitantes', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ error: 'El nombre es obligatorio' });

  try {
    await pool.query('INSERT INTO visitantes_home (nombre) VALUES ($1)', [nombre]);
    console.log('✅ Visitante registrado:', nombre);
    res.status(201).json({ mensaje: 'Visitante guardado' });
  } catch (error) {
    console.error('Error en visitantes:', error);
    res.status(500).json({ error: 'Error en la base de datos' });
  }
});


// ==========================================
// 2. RUTAS PARA LA VISTA "GALERÍA"
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
    res.status(200).json({ mensaje: 'Imagen eliminada de Cloudinary y DB' });
  } catch (error) {
    console.error('Error al borrar imagen:', error);
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});


// ==========================================
// 3. CRUD: RUTAS PARA "CONTACTOS"
// ==========================================

// --- CREATE: Guardar nuevo contacto ---
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, telefono, fechaNacimiento, mensaje, captchaToken } = req.body;

  if (!captchaToken) return res.status(400).json({ error: 'Captcha requerido' });

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY; 
    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captchaToken}`;
    const googleResponse = await fetch(verifyUrl, { method: 'POST' });
    const googleData = await googleResponse.json();

    if (googleData.success) {
      const query = `INSERT INTO contactos (nombre, email, telefono, fecha_nacimiento, mensaje) VALUES ($1, $2, $3, $4, $5)`;
      await pool.query(query, [nombre, email, telefono, fechaNacimiento, mensaje]);
      res.status(200).json({ mensaje: 'Contacto guardado con éxito' });
    } else {
      res.status(400).json({ error: 'Validación de Captcha fallida' });
    }
  } catch (error) {
    console.error('Error en contacto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- READ: Obtener todos los mensajes ---
app.get('/api/contacto', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contactos ORDER BY id DESC');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// --- UPDATE: Editar un mensaje (Ahora incluye fecha_nacimiento) ---
app.put('/api/contacto/:id', async (req, res) => {
  const { id } = req.params;
  // Extraemos todos los campos, incluyendo fecha_nacimiento
  const { nombre, email, telefono, fecha_nacimiento, mensaje } = req.body;

  try {
    const query = `
      UPDATE contactos 
      SET nombre = $1, email = $2, telefono = $3, fecha_nacimiento = $4, mensaje = $5 
      WHERE id = $6
    `;
    const values = [nombre, email, telefono, fecha_nacimiento, mensaje, id];
    
    await pool.query(query, values);
    console.log(`✅ Registro ${id} actualizado completamente`);
    res.status(200).json({ mensaje: 'Contacto actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al editar:', error);
    res.status(500).json({ error: 'Error al actualizar registro en la base de datos' });
  }
});

// --- DELETE: Borrar un mensaje ---
app.delete('/api/contacto/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM contactos WHERE id = $1', [id]);
    console.log(`🗑️ Registro ${id} eliminado`);
    res.status(200).json({ mensaje: 'Contacto eliminado' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
});


// --- RUTA DE PRUEBA ---
app.get('/', (req, res) => {
  res.status(200).send('🚀 API Funcionando');
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor en puerto ${PORT}`);
});