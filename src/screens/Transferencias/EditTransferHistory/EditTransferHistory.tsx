import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Link, useParams, useNavigate } from "react-router-dom";

export const EditTransferHistory = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ubicacionAnterior: '',
    ubicacionNueva: '',
    motivoTraslado: '',
    responsableTraslado: '',
    observaciones: '',
    fechaTraslado: '',
    horaTraslado: '08:00'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    navigate(`/transfer-history/${id}`);
  };

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
          <h2 className="text-white text-xl">Editar/Agregar Traslado Animal {id}</h2>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación Anterior:</label>
                <Input
                  value={formData.ubicacionAnterior}
                  onChange={(e) => setFormData({ ...formData, ubicacionAnterior: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="rounded-lg overflow-hidden border shadow">
                <iframe
                  title="Mapa Ubicación Anterior"
                  width="100%"
                  height="250"
                  loading="lazy"
                  allowFullScreen
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE&q=${encodeURIComponent(formData.ubicacionAnterior || "Santa Cruz Bolivia")}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación Nueva:</label>
                <Input
                  value={formData.ubicacionNueva}
                  onChange={(e) => setFormData({ ...formData, ubicacionNueva: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div className="rounded-lg overflow-hidden border shadow">
                <iframe
                  title="Mapa Ubicación Nueva"
                  width="100%"
                  height="250"
                  loading="lazy"
                  allowFullScreen
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE&q=${encodeURIComponent(formData.ubicacionNueva || "Santa Cruz Bolivia")}`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Motivo Traslado:</label>
                <Input
                  value={formData.motivoTraslado}
                  onChange={(e) => setFormData({ ...formData, motivoTraslado: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsable del Traslado:</label>
                <Input
                  value={formData.responsableTraslado}
                  onChange={(e) => setFormData({ ...formData, responsableTraslado: e.target.value })}
                  className="w-full"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones:</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Fecha y Hora de Traslado:</label>
                <div className="flex gap-4">
                  <Input
                    type="date"
                    value={formData.fechaTraslado}
                    onChange={(e) => setFormData({ ...formData, fechaTraslado: e.target.value })}
                    className="flex-1"
                    required
                  />
                  <Input
                    type="time"
                    value={formData.horaTraslado}
                    onChange={(e) => setFormData({ ...formData, horaTraslado: e.target.value })}
                    className="w-24"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Button type="submit" className="bg-green-500 text-white hover:bg-green-600 px-8">
              GUARDAR
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
