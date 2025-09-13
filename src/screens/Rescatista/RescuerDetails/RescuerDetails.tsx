import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui/button";
import { Navbar } from "../../../components/Navbar";
import { getRescatistaById, getRescatistasList } from "../../../services/dataService";
import { EditRescuer } from "../EditRescuer/EditRescuer";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

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
  const { getThemeClasses } = useThemeClasses();
  const [showEditRescuer, setShowEditRescuer] = useState(false);
  const [rescuerData, setRescuerData] = useState<Rescatista | null>(null);
  const resolveImageSrc = (src?: string) => {
    const fallback = "/imagenes/patita.png";
    if (!src) return fallback;
    const clean = String(src).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("/imagenes/")) return clean;
    const fileOnly = clean.split("/").pop() || clean;
    const host = import.meta.env.VITE_BACK;
    return `${host}/uploads/${fileOnly}`;
  };

  useEffect(() => {
    const fetchRescuer = async () => {
      try {
        // Intento 1: usar service por id
        try {
          const resc: any = await getRescatistaById(String(id));
          setRescuerData({
            _id: resc.id || resc._id,
            nombreRescatista: resc.nombre,
            telefonoContacto: resc.telefono,
            fechaRescate: resc.fechaRescatista,
            ubicacionRescate: resc.ubicacionRescate || resc.geolocalizacionId || "",
            detallesRescate: resc.descripcion || "",
            foto: resc.imagen ? `/uploads/${String(resc.imagen).split("/").pop()}` : "",
          });
          return;
        } catch {}

        // Intento 2: usar listado desde service
        const list = await getRescatistasList();
        const found = (list as any[]).find((x) => String(x.id) === String(id));
        if (!found) {
          setRescuerData(null);
          return;
        }
        setRescuerData({
          _id: found.id,
          nombreRescatista: found.nombre,
          telefonoContacto: found.telefono,
          fechaRescate: found.fechaRescatista,
          ubicacionRescate: found.ubicacionRescate || found.geolocalizacionId || "",
          detallesRescate: found.descripcion || "",
          foto: found.imagen ? `/uploads/${String(found.imagen).split("/").pop()}` : "",
        });
      } catch (err) {
        console.error("Error al obtener rescatista:", err);
        setRescuerData(null);
      }
    };
    if (id) fetchRescuer();
  }, [id]);

  if (showEditRescuer && id && rescuerData?._id) {
    return (
      <EditRescuer
        onClose={() => setShowEditRescuer(false)}
        isEditing={true}
        rescatistaId={rescuerData._id}
      />
    );
  }

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Geolocalización y Monitoreo" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="text-gray-700 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold text-green-800">Rescatista </h2>
        </div>

        {rescuerData ? (
          <div className={getThemeClasses(
            "grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow",
            "grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow shadow-green-200/50 border border-green-100"
          )}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <div className="text-right font-semibold">Nombre del rescatista:</div>
                <div>{rescuerData.nombreRescatista}</div>

                <div className="text-right font-semibold">Teléfono de contacto:</div>
                <div>{rescuerData.telefonoContacto}</div>

                <div className="text-right font-semibold">Fecha del Rescate:</div>
                <div>{new Date(rescuerData.fechaRescate).toLocaleDateString()}</div>

                <div className="text-right font-semibold hidden">Ubicación del Rescate:</div>
                <div hidden>{rescuerData.ubicacionRescate}</div>

                {rescuerData.detallesRescate && (
                  <>
                    <div className="text-right font-semibold">Detalles del Rescate:</div>
                    <div>{rescuerData.detallesRescate}</div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-56 h-56 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                <img
                  src={resolveImageSrc(rescuerData.foto)}
                  alt="Rescatista"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={getThemeClasses(
            "bg-white p-8 rounded-lg shadow text-center",
            "bg-white p-8 rounded-lg shadow shadow-green-200/50 border border-green-100 text-center"
          )}>
            <div className="flex flex-col items-center justify-center py-8">
              <div className={getThemeClasses(
                "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4",
                "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
              )}>
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No se encontró el rescatista</h3>
              <p className="text-gray-500 mb-4">El rescatista solicitado no existe o ha sido eliminado.</p>
              <button
                onClick={() => navigate(-1)}
                className={getThemeClasses(
                  "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200",
                  "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                )}
              >
                Volver Atrás
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end hidden">
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
