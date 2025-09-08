import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "../../../components/ui/button";
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
    const fetchRescuer = async () => {
      try {
        const base = import.meta.env.VITE_API_URL || "";
        // Intento 1: GET /rescatistas/:id
        const urlById = base ? `${base}/rescatistas/${id}` : `/rescatistas/${id}`;
        let r = await fetch(urlById, { cache: "no-store" });
        if (r.ok) {
          const raw = await r.json();
          const resc = raw?.postgres || raw; // soporta { postgres: {...} }
          setRescuerData({
            _id: resc.id || resc._id,
            nombreRescatista: resc.nombre,
            telefonoContacto: resc.telefono,
            fechaRescate: resc.fechaRescatista,
            ubicacionRescate: resc.ubicacionRescate || resc.geolocalizacionId || "",
            detallesRescate: resc.descripcion || "",
            foto: resc.imagen ? `/imagenes/${resc.imagen}` : "",
          });
          return;
        }

        // Intento 2: GET /rescatistas y buscar en postgres[]
        const urlAll = base ? `${base}/rescatistas` : `/rescatistas`;
        r = await fetch(urlAll, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        const list = Array.isArray(data) ? data : (data?.postgres ?? []);
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
          foto: found.imagen ? `/imagenes/${found.imagen}` : "",
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
    <div className="min-h-screen bg-green-100">
      {/* HEADER */}
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
          <div className="grid md:grid-cols-2 gap-8 bg-white p-6 rounded-lg shadow">
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
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                {rescuerData.foto ? (
                  <img src="/imagenes/personita.png" alt="Rescatista" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <img src="/imagenes/personita.png" alt="Rescatista" className="h-full object-cover rounded-lg" />
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-red-500">No se encontró el rescatista.</p>
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
