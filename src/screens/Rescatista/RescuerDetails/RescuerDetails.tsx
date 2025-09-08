import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAllRescatistas } from "../../../services/dataService";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { EditRescuer } from "../EditRescuer/EditRescuer";

interface Rescatista {
  _id: string;
  nombreRescatista: string;
  telefonoContacto: string;
  fechaRescate: string;
  ubicacionRescate: string;
  detallesRescate?: string;
  foto?: string;
}

export const RescuerDetails = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showEditRescuer, setShowEditRescuer] = useState(false);
  const [rescuerData, setRescuerData] = useState<Rescatista | null>(null);

  useEffect(() => {
    getAllRescatistas()
      .then((res: { data: Rescatista[] }) => {
        const found = res.data.find((r) => r._id === id);
        setRescuerData(found || null);
      })
      .catch((err: unknown) => console.error("Error al obtener rescatista:", err));
  }, [id]);

  if (showEditRescuer && id) {
    return (
      <EditRescuer
        animalId={Number(id)}
        onClose={() => setShowEditRescuer(false)}
        isEditing={true}
        rescatistaId={id}
      />
    );
  }

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Geolocalización y Monitoreo" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-white text-xl font-semibold">Rescatista del Animal {id}</h2>
        </div>

        {rescuerData ? (
          <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-right font-semibold">Nombre del rescatista:</div>
                <div>{rescuerData.nombreRescatista}</div>

                <div className="text-right font-semibold">Teléfono de contacto:</div>
                <div>{rescuerData.telefonoContacto}</div>

                <div className="text-right font-semibold">Fecha del Rescate:</div>
                <div>{new Date(rescuerData.fechaRescate).toLocaleDateString()}</div>

                <div className="text-right font-semibold">Ubicación del Rescate:</div>
                <div>{rescuerData.ubicacionRescate}</div>

                {rescuerData.detallesRescate && (
                  <>
                    <div className="text-right font-semibold">Detalles del Rescate:</div>
                    <div>{rescuerData.detallesRescate}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <p className="font-semibold mb-2">Foto del rescatista:</p>
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                {rescuerData.foto ? (
                  <img src={rescuerData.foto} alt="Rescatista" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No se encontró el rescatista.</p>
        )}

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={() => setShowEditRescuer(true)} 
            className="bg-green-500 text-white hover:bg-green-600"
          >
            Editar Rescatista
          </Button>
        </div>
      </div>
    </div>
  );
};
