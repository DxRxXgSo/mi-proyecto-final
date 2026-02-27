import { useState, useEffect } from 'react';

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [visitantes, setVisitantes] = useState([]); // Estado para la lista

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // --- FUNCIÓN PARA TRAER VISITANTES ---
  const fetchVisitantes = async () => {
    try {
      const res = await fetch(`${API_URL}/api/visitantes`);
      const data = await res.json();
      setVisitantes(data);
    } catch (error) {
      console.error("Error al cargar visitantes:", error);
    }
  };

  // Cargar al montar el componente
  useEffect(() => {
    fetchVisitantes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nombre.trim() === '') return;

    setGuardando(true);

    try {
      const respuesta = await fetch(`${API_URL}/api/visitantes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre }),
      });

      if (respuesta.ok) {
        setEnviado(true);
        fetchVisitantes(); // Recargamos la lista automáticamente
      } else {
        alert('Hubo un problema al guardar tu nombre.');
      }
    } catch (error) {
      alert('No se pudo conectar con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        {/* CARD PRINCIPAL */}
        <div className="col-12 col-md-8 col-lg-6 text-center shadow-sm p-5 rounded-5 bg-white border border-light transition-all mb-5">
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
                  style={{ backgroundColor: '#a392cc', borderColor: '#a392cc' }}
                  disabled={guardando}
                >
                  {guardando ? 'Guardando...' : 'Entrar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="lead mb-4 text-secondary">
                Qué gusto tenerte aquí, <span className="fw-bold" style={{ color: '#a35a6d' }}>{nombre}</span>.
              </p>
              <button
                onClick={() => { setNombre(''); setEnviado(false); }}
                className="btn btn-link text-decoration-none text-muted small"
              >
                Cambiar nombre
              </button>
            </>
          )}
        </div>

        {/* --- NUEVA SECCIÓN: LISTA DE REGISTROS ABAJO --- */}
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <h5 className="text-center fw-bold mb-4" style={{ color: '#a392cc' }}>
              📍 Últimos visitantes registrados
            </h5>
            <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '300px' }}>
              {visitantes.length > 0 ? (
                visitantes.map((v, index) => (
                  <div key={v.id} className="list-group-item border-0 d-flex justify-content-between align-items-center py-3 border-bottom border-light">
                    <div className="d-flex align-items-center">
                      <span className="badge rounded-circle me-3" style={{ backgroundColor: '#f3f0ff', color: '#a392cc' }}>
                        {visitantes.length - index}
                      </span>
                      <span className="fw-bold text-dark">{v.nombre}</span>
                    </div>
                    <small className="text-muted">
                      {new Date(v.fecha_visita).toLocaleDateString()}
                    </small>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted small">Sé el primero en registrarte.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}