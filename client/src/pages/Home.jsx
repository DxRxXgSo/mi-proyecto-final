import { useState } from 'react';

export default function Home() {
  const [nombre, setNombre] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [guardando, setGuardando] = useState(false); // Nuevo estado

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nombre.trim() === '') return;

    setGuardando(true); // Desactiva el botón mientras guarda

    try {
      // Petición POST al servidor (asegúrate de usar el puerto correcto, ej. 5000)
      const respuesta = await fetch('http://localhost:5000/api/visitantes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre }),
      });

      if (respuesta.ok) {
        setEnviado(true); // Si se guardó en DB, mostramos la bienvenida
      } else {
        alert('Hubo un problema al guardar tu nombre en la base de datos.');
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
      <div className="row justify-content-center align-items-center vh-75">
        <div className="col-12 col-md-8 col-lg-6 text-center shadow-sm p-5 rounded-5 bg-white border border-light">
          <h1 className="display-4 fw-bold mb-3" style={{ color: '#9a81c1' }}>
            ¡Hola!
          </h1>

          {!enviado ? (
            <>
              <p className="lead mb-4 text-secondary">
                Por favor, escribe tu nombre:
              </p>

              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  className="form-control form-control-lg rounded-pill text-center mb-4"
                  placeholder="Tu nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={guardando} // Se bloquea al enviar
                />

                <button
                  type="submit"
                  className="btn btn-pastel-blue btn-lg px-5 rounded-pill shadow-sm text-white"
                  style={{ backgroundColor: '#a392cc', borderColor: '#a392cc' }}
                  disabled={guardando} // Se bloquea al enviar
                >
                  {guardando ? 'Guardando...' : 'Enviar'}
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="lead mb-4 text-secondary">
                ¡Bienvenido/a,{' '}
                <span style={{ color: '#a35a6d', fontWeight: '600' }}>
                  {nombre}
                </span>
                !
              </p>

              <button
                onClick={() => {
                  setNombre('');
                  setEnviado(false);
                }}
                className="btn btn-link text-decoration-none text-muted"
              >
                Cambiar nombre
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}