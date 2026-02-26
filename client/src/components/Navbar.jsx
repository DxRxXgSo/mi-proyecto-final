import { Link } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light navbar-pastel shadow-sm mb-4">
      <div className="container">
        {/* Lado Izquierdo: Botón Hamburguesa */}
        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido Colapsable */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/calculadora">Calculadora</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/formulario">Formulario</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/galeria">Galería</Link>
            </li>
            {/* NUEVO: Acceso al CRUD de Administración */}
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3 text-primary" to="/admin">Admin ⚙️</Link>
            </li>
          </ul>
        </div>

        {/* Breadcrumbs: Ahora visibles en móvil y PC */}
        <div className="ms-auto pt-2 pt-lg-0">
          <Breadcrumbs />
        </div>
      </div>
    </nav>
  );
}