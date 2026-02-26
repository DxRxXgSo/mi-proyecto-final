import { useState, useEffect } from 'react';

export default function AdminContactos() {
  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  // --- DETECTA AUTOMÁTICAMENTE LA API (Local o Producción) ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [editData, setEditData] = useState({
    id: '', nombre: '', email: '', telefono: '', fecha_nacimiento: '', mensaje: ''
  });

  const fetchContactos = async () => {
    try {
      const res = await fetch(`${API_URL}/api/contacto`); // Corregido a URL dinámica
      const data = await res.json();
      setContactos(data);
    } catch (error) {
      console.error("Error al cargar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContactos(); }, []);

  const filteredContactos = contactos.filter(c => 
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContactos.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredContactos.slice(indexOfFirstItem, indexOfLastItem);

  const getVisiblePages = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, start + 2);
    if (end - start < 2) start = Math.max(1, end - 2);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const prepararEdicion = (contacto) => {
    const fechaLimpia = contacto.fecha_nacimiento ? contacto.fecha_nacimiento.split('T')[0] : '';
    setEditData({ ...contacto, fecha_nacimiento: fechaLimpia });

    if (window.bootstrap) {
      const modalElement = document.getElementById('modalEditar');
      const modalInstance = new window.bootstrap.Modal(modalElement);
      modalInstance.show();
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === 'telefono') {
      const soloNumeros = value.replace(/[^0-9]/g, '');
      if (soloNumeros.length <= 10) setEditData({ ...editData, [name]: soloNumeros });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const guardarCambios = async (e) => {
    e.preventDefault();
    if (editData.telefono.length !== 10) {
      alert('⚠️ El teléfono debe tener exactamente 10 dígitos.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/contacto/${editData.id}`, { // Corregido
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (res.ok) {
        alert('✅ Registro actualizado');
        fetchContactos();
        const modalInstance = window.bootstrap.Modal.getInstance(document.getElementById('modalEditar'));
        if (modalInstance) modalInstance.hide();
      }
    } catch (error) {
      alert('❌ Error al conectar con el servidor');
    }
  };

  const eliminarContacto = async (id) => {
    if (!confirm('¿Seguro que quieres borrar este mensaje?')) return;
    await fetch(`${API_URL}/api/contacto/${id}`, { method: 'DELETE' }); // Corregido
    fetchContactos();
  };

  if (loading) return <div className="text-center py-5 fw-bold text-muted">Cargando registros...</div>;

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="fw-bold text-primary mb-0">Panel de Administración</h2>
        <div className="position-relative" style={{ minWidth: '300px' }}>
          <input 
            type="text" 
            className="form-control border-0 shadow-sm ps-4 py-2 rounded-pill" 
            placeholder="🔍 Buscar por nombre o email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-primary text-white">
              <tr>
                <th className="ps-4">Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Fecha Nac.</th>
                <th>Mensaje</th>
                <th className="text-center pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((c) => (
                  <tr key={c.id}>
                    <td className="ps-4 fw-bold">{c.nombre}</td>
                    <td>{c.email}</td>
                    <td>{c.telefono}</td>
                    <td>{c.fecha_nacimiento ? new Date(c.fecha_nacimiento).toLocaleDateString() : 'N/A'}</td>
                    <td className="text-muted text-truncate" style={{ maxWidth: '150px' }}>{c.mensaje}</td>
                    <td className="text-center pe-4">
                      <button className="btn btn-sm btn-outline-primary border-0 me-1" onClick={() => prepararEdicion(c)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger border-0" onClick={() => eliminarContacto(c.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No se encontraron resultados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link border-0 shadow-sm mx-1 rounded px-3" onClick={() => paginate(1)}>{"<<"}</button>
            </li>
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button className="page-link border-0 shadow-sm mx-1 rounded px-3" onClick={() => paginate(currentPage - 1)}>{"<"}</button>
            </li>

            {getVisiblePages().map((page) => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button 
                  className={`page-link border-0 shadow-sm mx-1 rounded px-3 ${currentPage === page ? 'bg-primary text-white' : ''}`} 
                  onClick={() => paginate(page)}
                >
                  {page}
                </button>
              </li>
            ))}

            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link border-0 shadow-sm mx-1 rounded px-3" onClick={() => paginate(currentPage + 1)}>{">"}</button>
            </li>
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button className="page-link border-0 shadow-sm mx-1 rounded px-3" onClick={() => paginate(totalPages)}>{" >>"}</button>
            </li>
          </ul>
        </nav>
      )}

      {/* MODAL PARA EDITAR */}
      <div className="modal fade" id="modalEditar" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 rounded-4 shadow">
            <form onSubmit={guardarCambios}>
              <div className="modal-header bg-primary text-white border-0 py-3">
                <h5 className="modal-title fw-bold">Editar Información</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Nombre Completo</label>
                    <input type="text" name="nombre" value={editData.nombre} onChange={handleEditChange} className="form-control bg-light border-0" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Email</label>
                    <input type="email" name="email" value={editData.email} onChange={handleEditChange} className="form-control bg-light border-0" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted text-uppercase">Teléfono</label>
                    <input type="text" name="telefono" value={editData.telefono} onChange={handleEditChange} className="form-control bg-light border-0" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Fecha de Nacimiento</label>
                    <input type="date" name="fecha_nacimiento" value={editData.fecha_nacimiento} onChange={handleEditChange} className="form-control bg-light border-0" required />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted text-uppercase">Mensaje</label>
                    <textarea name="mensaje" value={editData.mensaje} onChange={handleEditChange} className="form-control bg-light border-0" rows="3" required></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-light px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="submit" className="btn btn-primary px-4 fw-bold">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}