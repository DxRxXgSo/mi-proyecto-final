import React, { useState, useEffect, useRef } from 'react';
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from '@cloudinary/react';
import { fill } from "@cloudinary/url-gen/actions/resize";

const Galeria = () => {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  const carouselRef = useRef(null);

  // --- CONFIGURACIÓN DINÁMICA ---
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const CLOUD_NAME = 'dhyze2nig'; // Tu Cloud Name de Cloudinary

  const cld = new Cloudinary({
    cloud: { cloudName: CLOUD_NAME } 
  });

  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/imagenes`);
      if (!response.ok) throw new Error('Servidor no disponible');
      
      const data = await response.json();
      const publicIds = data.map(img => img.public_id);
      setImages(publicIds);
    } catch (error) {
      console.warn("Error al conectar con la API de imágenes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const goToImage = (index) => {
    setSelectedIndex(index);
    if (window.bootstrap && carouselRef.current) {
      const carouselInstance = window.bootstrap.Carousel.getOrCreateInstance(carouselRef.current);
      carouselInstance.to(index);
    }
  };

  const handleUpload = () => {
    if (window.cloudinary) {
      window.cloudinary.openUploadWidget(
        {
          cloudName: CLOUD_NAME,
          uploadPreset: 'ml_default', 
          sources: ['local', 'url', 'camera'],
          resourceType: 'image', 
          clientAllowedFormats: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
        },
        async (error, result) => {
          if (!error && result && result.event === "success") {
            const newId = result.info.public_id;
            
            // 1. Actualizar estado local
            setImages((prev) => {
              const updated = [...prev, newId];
              setTimeout(() => goToImage(updated.length - 1), 100);
              return updated;
            });

            // 2. Guardar en tu base de datos de Render
            try {
              await fetch(`${API_URL}/api/imagenes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ public_id: newId })
              });
            } catch (err) {
              console.error("Error al guardar referencia en DB:", err);
            }
          }
        }
      );
    }
  };

  const handleDelete = async (publicIdToDelete) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta imagen de la nube y la base de datos?")) return;

    try {
      const idSeguro = encodeURIComponent(publicIdToDelete);
      
      // Elimina en Cloudinary y en tu DB a través de tu API
      const response = await fetch(`${API_URL}/api/imagenes?public_id=${idSeguro}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar');

      setImages((prev) => prev.filter(id => id !== publicIdToDelete));
      if (selectedIndex > 0) goToImage(0);

    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar la imagen.");
    }
  };

  if (loading) return <div className="text-center py-5 fw-bold text-muted">Cargando galería...</div>;

  return (
    <div className="container-fluid bg-light py-4" style={{ minHeight: '100vh' }}>
      <div className="row g-4">
        
        {/* PANEL IZQUIERDO: Control y Lista */}
        <div className="col-lg-3">
          <div className="card shadow-sm border-0 rounded-4 p-3 h-100">
            <div className="bg-primary bg-opacity-10 py-3 mb-4 rounded-3 text-center">
              <h5 className="mb-0 fw-bold text-primary">Gestión de Fotos</h5>
            </div>

            <button 
              onClick={handleUpload} 
              className="btn w-100 mb-4 fw-bold shadow-sm text-white" 
              style={{ backgroundColor: '#A594F9', border: 'none' }}
            >
              + Subir a la Nube
            </button>

            <h6 className="text-muted small fw-bold text-uppercase mb-3 px-2">Colección ({images.length})</h6>
            <div className="list-group list-group-flush overflow-auto custom-scrollbar" style={{ maxHeight: '60vh' }}>
              {images.map((id, index) => (
                <div 
                  key={`${id}-${index}`} 
                  onClick={() => goToImage(index)} 
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-2 transition-all ${
                    selectedIndex === index ? 'bg-white shadow-sm text-primary fw-bold border-start border-primary border-4' : 'bg-transparent'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center">
                      <div className="rounded me-2 overflow-hidden flex-shrink-0 shadow-sm" style={{ width: '40px', height: '40px' }}>
                         <AdvancedImage 
                          cldImg={cld.image(id).resize(fill().width(80).height(80))} 
                          className="w-100 h-100 object-fit-cover" 
                         />
                      </div>
                      <span className="text-truncate small">Foto {index + 1}</span>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(id);
                      }} 
                      className="btn btn-sm btn-outline-danger border-0 opacity-75"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
              {images.length === 0 && <p className="text-muted small text-center mt-3">No hay fotos en la nube</p>}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: Carrusel Principal */}
        <div className="col-lg-9">
          <div className="card shadow-sm border-0 rounded-4 p-4 bg-white h-100 d-flex flex-column">
            <div className="flex-grow-1 d-flex align-items-center justify-content-center">
              {images.length > 0 ? (
                <div 
                  id="carouselGaleria" 
                  ref={carouselRef}
                  className="carousel slide shadow rounded-4 overflow-hidden w-100" 
                  data-bs-ride="false"
                >
                  <div className="carousel-inner">
                    {images.map((id, index) => (
                      <div key={`slide-${id}`} className={`carousel-item ${index === selectedIndex ? 'active' : ''}`}>
                        <AdvancedImage 
                          cldImg={cld.image(id).resize(fill().width(1200).height(700))} 
                          className="d-block w-100 object-fit-cover"
                          style={{ height: '550px', backgroundColor: '#f8f9fa' }}
                        />
                        <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-pill mx-auto mb-3 px-4" style={{ width: 'fit-content' }}>
                          <p className="m-0 small">Visualizando {index + 1} de {images.length}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {images.length > 1 && (
                    <>
                      <button className="carousel-control-prev" type="button" data-bs-target="#carouselGaleria" data-bs-slide="prev" onClick={() => setSelectedIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                      </button>
                      <button className="carousel-control-next" type="button" data-bs-target="#carouselGaleria" data-bs-slide="next" onClick={() => setSelectedIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="display-1 text-light mb-3">📸</div>
                  <p className="text-muted">La galería está vacía. ¡Sube tu primera foto!</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Galeria;