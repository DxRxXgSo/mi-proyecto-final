import { useState } from 'react';
import { Link } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

export default function Formulario() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    mensaje: ''
  });

  const [captchaToken, setCaptchaToken] = useState(null);

  // --- FUNCIÓN CORREGIDA: Filtra letras y limita a 10 números ---
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'telefono') {
      // Reemplaza cualquier caracter que NO sea un número por nada
      const soloNumeros = value.replace(/[^0-9]/g, '');
      
      // Solo actualiza si tiene 10 dígitos o menos
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

    // Validación de edad
    if (!esMayorDeEdad(formData.fechaNacimiento)) {
      alert('Debes tener entre 18 y 120 años.');
      return;
    }

    // Validación de longitud de teléfono
    if (formData.telefono.length !== 10) {
      alert('El teléfono debe tener exactamente 10 dígitos.');
      return;
    }

    if (!captchaToken) {
      alert('Por favor, verifica que no eres un robot completando el reCAPTCHA.');
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:5000/api/contacto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          captchaToken: captchaToken 
        }),
      });

      const resultado = await respuesta.json();

      if (respuesta.ok) {
        alert('¡Formulario enviado y validado con éxito!');
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          fechaNacimiento: '',
          mensaje: ''
        });
      } else {
        alert('Error: ' + resultado.error);
      }

    } catch (error) {
      console.error('Error al enviar:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            {/* Encabezado */}
            <div
              className="p-4 text-white d-flex align-items-center gap-3"
              style={{ backgroundColor: '#a392cc' }}
            >
              <div
                className="bg-white rounded-circle p-2 d-flex align-items-center justify-content-center"
                style={{ width: '50px', height: '50px' }}
              >
                <span style={{ color: '#a392cc', fontSize: '1.5rem' }}>📝</span>
              </div>
              <div>
                <h3 className="mb-0 fw-bold">Formulario de Contacto</h3>
                <p className="mb-0 small opacity-75">
                  Todos los campos son obligatorios
                </p>
              </div>
            </div>

            <div className="card-body p-4 bg-white">
              <form onSubmit={handleSubmit} noValidate>

                {/* Nombre */}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    className="form-control border-0 bg-light rounded-3"
                    required
                    onChange={handleChange}
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className="form-control border-0 bg-light rounded-3"
                    required
                    onChange={handleChange}
                  />
                </div>

                {/* Teléfono - Ahora filtrado */}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    placeholder=""
                    value={formData.telefono}
                    className="form-control border-0 bg-light rounded-3"
                    required
                    onChange={handleChange}
                  />
                  <div className="form-text small">Solo números (10 dígitos)</div>
                </div>

                {/* Fecha */}
                <div className="mb-3">
                  <label className="form-label text-muted small fw-bold">
                    Fecha de nacimiento *
                  </label>
                  <input
                    type="date"
                    name="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    className="form-control border-0 bg-light rounded-3"
                    required
                    onChange={handleChange}
                  />
                </div>

                {/* Mensaje */}
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold">
                    Mensaje *
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    className="form-control border-0 bg-light rounded-3"
                    rows="4"
                    required
                    onChange={handleChange}
                  ></textarea>
                </div>

                <div className="mb-4 d-flex justify-content-center">
                  <ReCAPTCHA
                     sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} // <-- Asegúrate de que diga exactamente esto
                     onChange={handleCaptcha}
                  />
                </div>

                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-lg text-white rounded-3 shadow-sm py-3 fw-bold"
                    style={{ backgroundColor: '#7b61ff' }}
                  >
                    🚀 Enviar Formulario
                  </button>
                </div>

                <div className="text-center">
                  <hr className="text-muted opacity-25" />
                  <Link
                    to="/"
                    className="text-decoration-none fw-bold small"
                    style={{ color: '#7b61ff' }}
                  >
                    ← Volver al Inicio
                  </Link>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}