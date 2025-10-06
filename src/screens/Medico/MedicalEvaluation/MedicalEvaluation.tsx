import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { getAnimalById } from "../../../services/dataService";
import { getEvaluationByAnimal } from "../../../services/medicalService";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const MedicalEvaluation = (): JSX.Element => {
  const { id } = useParams(); // id del animal
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const [animalName, setAnimalName] = useState<string>("");
  const [evaluations, setEvaluations] = useState<any[]>([]);
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
          const res = await getEvaluationByAnimal(name);
          const data: any = res?.data;
          const list = Array.isArray(data) ? data : (data?.postgres ?? []);
          if (!alive) return;
          const normalize = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const onlyThisAnimal = (Array.isArray(list) ? list : []).filter((ev: any) => normalize(ev?.nombreAnimal) === normalize(name));
          setEvaluations(onlyThisAnimal);
        } else {
          setEvaluations([]);
        }
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error al cargar evaluaciones");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar 
        title="Evaluación Médica" 
        showBackButton={true} 
        onBackClick={() => navigate(-1)} 
      />

      {/* CONTENIDO */}
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-green-800 mb-6">
          Evaluaciones Médicas - {animalName || `Animal ${id}`}
        </h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => navigate(`/veterinario/${id}`)}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
          >
            Agregar Evaluación Médica
          </button>
        </div>

        {loading && (
          <div className="text-gray-600">Cargando evaluaciones...</div>
        )}
        {error && (
          <div className="text-red-600">{error}</div>
        )}

        {!loading && !error && (
          evaluations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluations.map((ev: any, idx: number) => (
                <div key={ev.id || idx} className={getThemeClasses(
                  "bg-white p-4 rounded-lg shadow",
                  "bg-white p-4 rounded-lg shadow shadow-green-200/50 border border-green-100"
                )}>
                  <div className="font-semibold mb-1">Diagnóstico</div>
                  <div className="mb-2">{ev.diagnostico}</div>
                  {ev.sintomas && (<>
                    <div className="font-semibold mb-1">Síntomas</div>
                    <div className="mb-2">{ev.sintomas}</div>
                  </>)}
                  {ev.medicacion && (<>
                    <div className="font-semibold mb-1">Medicación</div>
                    <div className="mb-2">{ev.medicacion}</div>
                  </>)}
                  <div className="text-sm text-gray-600">Fecha: {new Date(ev.fechaEvaluacion).toLocaleString()}</div>
                  {ev.proximaRevision && (
                    <div className="text-sm text-gray-600">Próxima: {new Date(ev.proximaRevision).toLocaleString()}</div>
                  )}
                  {ev.responsableNombre && (
                    <div className="text-sm mt-2">Responsable: {ev.responsableNombre}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={getThemeClasses(
              "bg-white p-6 rounded-lg shadow text-center text-gray-600",
              "bg-white p-6 rounded-lg shadow shadow-green-200/50 border border-green-100 text-center text-gray-600"
            )}>
              <div className="flex flex-col items-center justify-center py-8">
                <div className={getThemeClasses(
                  "w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4",
                  "w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4"
                )}>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay evaluaciones registradas</h3>
                <p className="text-gray-500 mb-4">Este animal aún no tiene evaluaciones médicas registradas.</p>
                <button
                  onClick={() => navigate(`/veterinario/${id}`)}
                  className={getThemeClasses(
                    "px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200",
                    "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                  )}
                >
                  Agregar Primera Evaluación
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};
