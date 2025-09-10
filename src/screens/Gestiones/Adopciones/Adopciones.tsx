import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../../components/Navbar";
import { usePets } from "../../../services/usePets";

export const Adopciones = (): JSX.Element => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-green-400/80">
      <Navbar title="Adopciones" />

      {/* sin dropdown */}

      {/* Lista de Animales en Adopción */}
      <div className="container mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Animales en Adopción</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {domesticosSanos.map((p: any) => (
            <div key={p.id} className="bg-white rounded-lg shadow-md p-4">
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
      </div>
    </div>
  );
};
