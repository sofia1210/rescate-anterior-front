import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";

export const Geolocation = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Simulación de datos (puede venir de una API)
  const [geoData, setGeoData] = useState<{
    fecha?: string;
    ubicacion?: string;
  }>({
    // 🔴 Dejá esto vacío para probar el "no hay datos"
    // fecha: "2024-12-01",
    // ubicacion: "Santa Cruz de la Sierra",
  });

  const handleAdd = () => {
    // En una app real abriría un modal o redirigiría a un formulario
    setGeoData({
      fecha: "2024-12-01",
      ubicacion: "Santa Cruz de la Sierra",
    });
  };

  return (
    <div className="min-h-screen bg-green-400/80">
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Geolocalización y Monitoreo</h1>
          </div>
          <nav className="flex gap-6">
            <Link to="/reports" className="text-white flex items-center gap-2">
              <img src="/imagenes/reportesillo.png" alt="Reportes" className="w-10 h-10" />
              Reportes
            </Link>
            <Link to="/management" className="text-white flex items-center gap-2">
              <img src="/imagenes/Gestion.png" alt="Gestiones" className="w-12 h-12" />
              Gestiones
            </Link>
            <Link to="/pets" className="text-white flex items-center gap-2">
              <img src="/imagenes/home.png" alt="Home" className="w-8 h-8" />
              Home
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-white text-xl">Geolocalización y Monitoreo Animal {id}</h2>
        </div>

        {geoData.fecha && geoData.ubicacion ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Datos del Rescate</h3>
              <p><strong>Fecha de rescate:</strong> {geoData.fecha}</p>
              <p><strong>Ubicación aproximada:</strong> {geoData.ubicacion}</p>
              <p><strong>Observaciones:</strong> El animal fue encontrado cerca del canal Isuto.</p>
            </div>

            <div className="rounded-lg overflow-hidden shadow-md">
              <iframe
                title="Mapa Animal"
                width="100%"
                height="350"
                loading="lazy"
                allowFullScreen
                style={{ border: 0 }}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE&q=${encodeURIComponent(geoData.ubicacion)}`}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-700 mb-4">No hay datos de geolocalización disponibles.</p>
            <Button onClick={handleAdd} className="bg-green-500 text-white hover:bg-green-600">
              Añadir Geolocalización
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
