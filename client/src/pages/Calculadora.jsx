import { useState } from 'react';

export default function Calculadora() {
  const [num1, setNum1] = useState('');
  const [num2, setNum2] = useState('');
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  // Función para validar que solo entren números
  const handleInputChange = (e, setter) => {
    const value = e.target.value;
    // Expresión regular: permite números y un punto decimal
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setter(value);
      setError('');
    }
  };

  const realizarOperacion = (operacion) => {
    const n1 = parseFloat(num1);
    const n2 = parseFloat(num2);

    if (isNaN(n1) || isNaN(n2)) {
      setError('Por favor, ingresa ambos números.');
      return;
    }

    if (operacion === 'suma') {
      setResultado(n1 + n2);
    } else if (operacion === 'division') {
      if (n2 === 0) {
        setError('No se puede dividir entre cero.');
        setResultado(null);
      } else {
        setResultado(n1 / n2);
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
            {/* Encabezado Pastel */}
            <div className="p-4 text-center" style={{ backgroundColor: '#e2d1f9', color: '#6a5a8a' }}>
              <h3 className="fw-bold mb-0">Calculadora Pastel</h3>
            </div>

            <div className="card-body p-4 bg-white">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="mb-3">
                <label className="form-label text-muted small fw-bold">Número 1</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 bg-light rounded-3"
                  placeholder="0"
                  value={num1}
                  onChange={(e) => handleInputChange(e, setNum1)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted small fw-bold">Número 2</label>
                <input
                  type="text"
                  className="form-control form-control-lg border-0 bg-light rounded-3"
                  placeholder="0"
                  value={num2}
                  onChange={(e) => handleInputChange(e, setNum2)}
                />
              </div>

              <div className="d-flex gap-3 mb-4">
                <button 
                  onClick={() => realizarOperacion('suma')}
                  className="btn flex-fill py-3 rounded-pill fw-bold shadow-sm"
                  style={{ backgroundColor: '#d0e7ff', color: '#5a7fa3' }}
                >
                  Sumar (+)
                </button>
                <button 
                  onClick={() => realizarOperacion('division')}
                  className="btn flex-fill py-3 rounded-pill fw-bold shadow-sm"
                  style={{ backgroundColor: '#ffdce5', color: '#a35a6d' }}
                >
                  Dividir (÷)
                </button>
              </div>

              {resultado !== null && (
                <div className="text-center p-3 rounded-4" style={{ backgroundColor: '#f8f9fa' }}>
                  <span className="text-muted d-block small">Resultado:</span>
                  <span className="display-6 fw-bold text-dark">{resultado}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}