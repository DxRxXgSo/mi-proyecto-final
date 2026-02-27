import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

export default function Formulario() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    mensaje: ''
  });

  const [contactos, setContactos] = useState([]); // Estado para la lista de abajo
  const [captchaToken, setCaptchaToken] = useState(null);

  // --- FUNCIÓN PARA TRAER LOS CONTACTOS ---
  const fetchContactos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contacto`);
      const data = await res.json();
      setContactos(data);
    } catch (error) {
      console.error("Error al cargar contactos:", error);
    }
  };

  useEffect(() => {
    fetchContactos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      if (soloNumeros.length <= 10) {
        setFormData({ ...formData, [name]: soloNumeros });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCaptcha = (token) => {
    setCaptchaToken(token);
  };

  const esMayorDeEdad = (fecha) => {
    if (!fecha) return false;
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad >= 18 && edad <= 120;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!esMayorDeEdad(formData.fecha_nacimiento)) {
      alert('Debes tener entre 18 y 120 años.');
      return;
    }

    if (formData.telefono.length !== 10) {
      alert('El teléfono debe tener exactamente 10 dígitos.');
      return;
    }

    if (!captchaToken) {
      alert('Por favor, completa el reCAPTCHA.');
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/api/contacto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaToken 
        }),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert('¡Formulario enviado con éxito!');
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fecha_nacimiento: '',
          mensaje: ''
        });
        fetchContactos(); // RECARGA LA LISTA AL ENVIAR
      } else {
        alert('Error: ' + resultado.error);
      }
    } catch (error) {
      alert('Hubo un problema al conectar con el servidor.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        {/* COLUMNA DEL FORMULARIO */}
        <div className="col-12 col-md-8 col-lg-6 mb-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="p-4 text-white d-flex align-items-center gap-3" style={{ backgroundColor: '#a392cc' }}>
              <div className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                <span style={{ color: '#a392cc', fontSize: '1.5rem' }}>📝</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">Formulario de Contacto</h3>
                <p className="mb-0 small opacity-75">Todos los campos son obligatorios</p>
              </div>
            </div>

            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Nombre completo *</label>
                  <input type="text" name="nombre" value={formData.nombre} className="form-control border-0 bg-light rounded-3" required onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Correo electrónico *</label>
                  <input type="email" name="email" value={formData.email} className="form-control border-0 bg-light rounded-3" required onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Teléfono *</label>
                  <input type="tel" name="telefono" value={formData.telefono} className="form-control border-0 bg-light rounded-3" required onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">Fecha de nacimiento *</label>
                  <input type="date" name="fecha_nacimiento" value={formData.fecha_nacimiento} className="form-control border-0 bg-light rounded-3" required onChange={handleChange} />
                </div>
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">Mensaje *</label>
                  <textarea name="mensaje" value={formData.mensaje} className="form-control border-0 bg-light rounded-3" rows="4" required onChange={handleChange}></textarea>
                </div>
                <div className="mb-4 d-flex justify-content-center">
                  <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={handleCaptcha} />
                </div>
                <div className="d-grid mb-4">
                  <button type="submit" className="btn btn-lg text-white rounded-3 shadow-sm py-3 fw-bold" style={{ backgroundColor: '#7b61ff' }}>
                    🚀 Enviar Formulario
                  </button>
                </div>
                <div className="text-center">
                  <hr className="text-muted opacity-25" />
                  <Link to="/" className="text-decoration-none fw-bold small" style={{ color: '#7b61ff' }}>← Volver al Inicio</Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* --- NUEVA SECCIÓN: LISTA DE MENSAJES ABAJO --- */}
        <div className="col-12 col-lg-10">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="fw-bold mb-4" style={{ color: '#a392cc' }}>
              📫 Mensajes Recibidos recientemente
            </h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Mensaje</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {contactos.length > 0 ? (
                    contactos.slice(0, 5).map((c) => ( // Mostramos solo los últimos 5
                      <tr key={c.id}>
                        <td className="fw-bold">{c.nombre}</td>
                        <td className="text-muted">{c.mensaje}</td>
                        <td>{new Date(c.fecha_envio || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center text-muted py-3">No hay mensajes aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}