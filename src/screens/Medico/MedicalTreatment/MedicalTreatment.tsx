import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { getAnimalById } from "../../../services/dataService";
import { getTreatmentByAnimal } from "../../../services/medicalService";

export const MedicalTreatmentView = (): JSX.Element => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [animalName, setAnimalName] = useState<string>("");
  const [treatments, setTreatments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const animal: any = await getAnimalById(String(id));
        const name = animal?.nombre || animal?.name || "";
        if (!alive) return;
        setAnimalName(name);

        if (name) {
          const res = await getTreatmentByAnimal(name);
          const data: any = res?.data;
          const list = Array.isArray(data) ? data : (data?.postgres ?? []);
          if (!alive) return;
          const normalize = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const onlyThisAnimal = (Array.isArray(list) ? list : []).filter((t: any) => normalize(t?.nombreAnimal) === normalize(name));
          setTreatments(onlyThisAnimal);
        } else {
          setTreatments([]);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error al cargar tratamientos");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="min-h-screen bg-green-400/80">
      <Navbar 
        title="Tratamiento Médico" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      <div className="p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Tratamientos - {animalName || `Animal ${id}`}
        </h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => navigate(`/veterinario/${id}`)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Añadir Tratamiento
          </button>
        </div>

        {loading && (<div className="text-gray-600">Cargando tratamientos...</div>)}
        {error && (<div className="text-red-600">{error}</div>)}

        {!loading && !error && (
          treatments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {treatments.map((t: any, idx: number) => (
                <div key={t.id || idx} className="bg-white p-4 rounded-lg shadow">
                  <div className="font-semibold mb-1">Tratamiento</div>
                  <div className="mb-2">{t.tratamiento || t.nombre || "-"}</div>
                  {t.duracion && (
                    <div className="text-sm text-gray-700">Duración: {t.duracion}</div>
                  )}
                  {t.observaciones && (
                    <div className="text-sm text-gray-700">Observaciones: {t.observaciones}</div>
                  )}
                  <div className="text-sm text-gray-600">Fecha: {new Date(t.fechaTratamiento || t.fechaInicio || Date.now()).toLocaleString()}</div>
                  {t.responsableNombre && (
                    <div className="text-sm mt-2">Responsable: {t.responsableNombre}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow text-center text-gray-600">No hay tratamientos registrados.</div>
          )
        )}
      </div>
    </div>
  );
};
