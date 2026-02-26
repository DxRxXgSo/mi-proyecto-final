import { Link, useLocation } from 'react-router-dom';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // No mostramos migas de pan si estamos en la raíz (Home)
  if (location.pathname === '/') return null;

  return (
    <nav aria-label="breadcrumb">
      <ol 
        className="breadcrumb mb-0 flex-nowrap" 
        style={{ 
          fontSize: '0.75rem', // Un poco más pequeño para móviles
          whiteSpace: 'nowrap'
        }}
      >
        <li className="breadcrumb-item">
          <Link to="/" className="text-decoration-none text-muted">Inicio</Link>
        </li>
        
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Formateo de texto: "mi-perfil" -> "Mi perfil"
          const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

          return last ? (
            <li 
              key={to} 
              className="breadcrumb-item active text-truncate" 
              aria-current="page" 
              style={{ maxWidth: '100px' }} // Evita que nombres largos rompan el Navbar en móvil
            >
              {displayName}
            </li>
          ) : (
            <li key={to} className="breadcrumb-item">
              <Link to={to} className="text-decoration-none text-muted">
                {displayName}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}