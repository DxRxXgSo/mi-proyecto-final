import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calculadora from './pages/Calculadora';
import Formulario from './pages/Formulario';
import Galeria from './pages/Galeria';
import AdminContactos from './pages/AdminContactos'; // <-- NUEVA IMPORTACIÓN
import ErrorPage from './pages/ErrorPage';

function App() {
  return (
    <Router>
      {/* Navbar visible en todas las vistas */}
      <Navbar />

      {/* Contenedor Bootstrap */}
      <main className="container mt-4">
        <Routes>
          {/* Vistas principales */}
          <Route path="/" element={<Home />} />
          <Route path="/calculadora" element={<Calculadora />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/galeria" element={<Galeria />} />
          
          {/* Nueva vista CRUD para administrar contactos */}
          <Route path="/admin" element={<AdminContactos />} />

          {/* Error 500 (ruta manual para errores del servidor) */}
          <Route path="/error-500" element={<ErrorPage type="500" />} />

          {/* Error 404 (cualquier ruta inexistente) */}
          <Route path="*" element={<ErrorPage type="404" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;