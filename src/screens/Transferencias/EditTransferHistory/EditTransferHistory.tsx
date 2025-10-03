import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { Breadcrumbs } from "../../../components/ui/breadcrumbs";

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
      <Navbar 
        title="Editar Historial de Traslados" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-4">
        <Breadcrumbs items={[
          { label: "Historial", path: `/transfer-history/${id}` },
          { label: "Editar Traslado", current: true }
        ]} />
        
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Editar/Agregar Traslado Animal {id}</h2>
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
                  minLength={3}
                  maxLength={140}
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
                  minLength={3}
                  maxLength={140}
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
                  minLength={3}
                  maxLength={140}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Responsable del Traslado:</label>
                <Input
                  value={formData.responsableTraslado}
                  onChange={(e) => setFormData({ ...formData, responsableTraslado: e.target.value })}
                  className="w-full"
                  minLength={3}
                  maxLength={80}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Observaciones:</label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  maxLength={500}
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
                    max={new Date().toISOString().split('T')[0]}
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
