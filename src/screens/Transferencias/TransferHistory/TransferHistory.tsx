import React from "react";
import { Button } from "../../../components/ui/button";
import { Link, useParams, useNavigate } from "react-router-dom";

export const TransferHistory = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-green-400/80">
      {/* Header */}
      <header className="bg-green-500/80 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/imagenes/Patota.png" alt="Logo" className="w-10 h-10" />
            <h1 className="text-white text-xl">Historial de Traslados y Seguimiento</h1>
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
          <h2 className="text-white text-xl">Historial de Traslados y Seguimiento Animal {id}</h2>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación anterior:</label>
                <div className="p-2 border rounded-md bg-gray-50">Ubicación anterior</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de traslado:</label>
                <div className="flex gap-2">
                  <div className="p-2 border rounded-md bg-gray-50 flex-1">Jun 10, 2024</div>
                  <div className="p-2 border rounded-md bg-gray-50 w-24">9:41 AM</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación nueva:</label>
                <div className="p-2 border rounded-md bg-gray-50">Ubicación nueva</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo del traslado:</label>
                <div className="p-2 border rounded-md bg-gray-50">Tratamiento administrado</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsable del traslado:</label>
                <div className="p-2 border rounded-md bg-gray-50">Responsable del traslado</div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones:</label>
                <div className="p-2 border rounded-md bg-gray-50">Observaciones</div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={() => navigate(`/transfer-history/${id}/edit`)}
                className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar/Editar Traslado
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};