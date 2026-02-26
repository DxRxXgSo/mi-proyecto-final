import { useState } from 'react';

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // --- DETECTA AUTOMÁTICAMENTE LA API ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nombre.trim() === '') return;

    setGuardando(true);

    try {
      // Petición dinámica usando la variable de entorno
      const respuesta = await fetch(`${API_URL}/api/visitantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      });

      if (respuesta.ok) {
        setEnviado(true);
        console.log(`✅ Visitante registrado: ${nombre}`);
      } else {
        alert('Hubo un problema al guardar tu nombre.');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      alert('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="col-12 col-md-8 col-lg-6 text-center shadow-sm p-5 rounded-5 bg-white border border-light transition-all">
          
          <div className="mb-4">
            <span style={{ fontSize: '4rem' }}>{enviado ? '🎉' : '👋'}</span>
          </div>

          <h1 className="display-4 fw-bold mb-3" style={{ color: '#9a81c1' }}>
            {enviado ? `¡Bienvenido/a!` : '¡Hola!'}
          </h1>

          {!enviado ? (
            <>
              <p className="lead mb-4 text-secondary">
                Estás entrando a mi proyecto final. <br />
                ¿Cómo te llamas?
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill text-center mb-4 border-2"
                  placeholder="Escribe tu nombre aquí"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={guardando}
                  required
                />

                <button
                  type="submit"
                  className="btn btn-lg px-5 rounded-pill shadow-sm text-white transition-all"
                  style={{ 
                    backgroundColor: '#a392cc', 
                    borderColor: '#a392cc',
                    opacity: guardando ? 0.7 : 1
                  }}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Guardando...
                    </>
                  ) : 'Entrar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="lead mb-4 text-secondary">
                Qué gusto tenerte aquí,{' '}
                <span className="fw-bold" style={{ color: '#a35a6d' }}>
                  {nombre}
                </span>.
              </p>
              
              <p className="small text-muted mb-4">
                Tu visita ha sido registrada en mi base de datos de Render.
              </p>

              <button
                onClick={() => {
                  setNombre('');
                  setEnviado(false);
                }}
                className="btn btn-link text-decoration-none text-muted small"
              >
                No soy {nombre}, cambiar nombre
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}