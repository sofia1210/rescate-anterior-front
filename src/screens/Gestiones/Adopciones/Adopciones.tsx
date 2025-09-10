import { useMemo } from "react";
import { Navbar } from "../../../components/Navbar";
import { usePets } from "../../../services/usePets";
import { useThemeClasses } from "../../../hooks/useThemeClasses";

export const Adopciones = (): JSX.Element => {
  const { getThemeClasses } = useThemeClasses();
  const { pets } = usePets(
    import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/animales` : "/animales"
  );
  const resolveImageSrc = (filename?: string | null) => {
    const fallback = "/imagenes/patita.png";
    if (!filename) return fallback;
    const clean = String(filename).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("/imagenes/")) return clean;
    const host = import.meta.env.VITE_BACK;
    const fileOnly = clean.split("/").pop() || clean;
    return `${host}/uploads/${fileOnly}`;
  };

  const domesticosSanos = useMemo(() => {
    const ok = new Set(["bueno", "muy bueno", "sano", "muy_bueno", "muy-bueno"]);
    return (pets || [])
      .filter((p: any) => (p?.tipo || "").toLowerCase() === "domestico")
      .filter((p: any) => ok.has((p?.healthStatus || "").toLowerCase()));
  }, [pets]);

  return (
    <div className={getThemeClasses(
      "min-h-screen bg-green-400/80",
      "min-h-screen bg-green-50"
    )}>
      <Navbar title="Adopciones" />

      {/* sin dropdown */}

      {/* Lista de Animales en Adopción */}
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Animales en Adopción</h2>
        
        {domesticosSanos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {domesticosSanos.map((p: any) => (
              <div key={p.id} className={getThemeClasses(
                "bg-white rounded-lg shadow-md p-4",
                "bg-white rounded-lg shadow-md shadow-green-200/50 border border-green-100 p-4"
              )}>
                <div className="w-full aspect-square bg-gray-100 rounded-md overflow-hidden mb-4 flex items-center justify-center">
                  <img src={resolveImageSrc(p.image)} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-gray-700">Especie: {p.species}</p>
                {p.breed && (<p className="text-gray-700">Raza: {p.breed}</p>)}
                {p.age && (<p className="text-gray-700">Edad: {p.age}</p>)}
                <p className="text-green-700 font-semibold mt-2">Estado: {p.healthStatus}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className={getThemeClasses(
            "flex flex-col items-center justify-center py-16 px-4",
            "flex flex-col items-center justify-center py-16 px-4"
          )}>
            <div className={getThemeClasses(
              "w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6",
              "w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
            )}>
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className={getThemeClasses(
              "text-xl font-semibold text-gray-600 mb-2",
              "text-xl font-semibold text-gray-700 mb-2"
            )}>
              No hay mascotas disponibles para adopción
            </h3>
            <p className={getThemeClasses(
              "text-gray-500 text-center max-w-md",
              "text-gray-600 text-center max-w-md"
            )}>
              En este momento no tenemos mascotas domésticas sanas disponibles para adopción. 
              ¡Vuelve pronto para conocer a nuestros nuevos amigos!
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Actualizamos nuestra lista regularmente</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
