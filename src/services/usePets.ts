// usePets.ts
"use client";
import { useEffect, useMemo, useState } from "react";

/** ===== Tipos ===== */
export type Pet = {
  id: string | number;
  name: string;
  species: string;
  breed: string;
  image: string | null;
  sex: string;
  age?: string; // "2 años" si viene número
  healthStatus?: string;
  admissionDate?: string;        // mapeada desde fechaRescate
  feedingType?: string;          // tipoAlimentacion
  recommendedAmount?: string;    // cantidadRecomendada
  recommendedFrequency?: string; // frecuenciaRecomendada
  releaseDate?: string;          // no existe en PG → default
  releaseLocation?: string;      // no existe en PG → default
  tipo?: string;
  rescuer?: {
    id?: string;
    name?: string;
    phone?: string;
    rescueDate?: string;      // fechaRescate
    rescueLocation?: string;  // ubicacionRescate
  };
};

type PostgresAnimal = {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  edad?: number;
  estadoSalud?: string;
  tipoAlimentacion?: string;
  cantidadRecomendada?: string;
  frecuenciaRecomendada?: string;
  fechaRescate?: string;
  ubicacionRescate?: string;
  detallesRescate?: string | null;
  imagen?: string | null;
  tipo?: string;
  rescatista_id?: string;
  geolocalizacion_id?: string;
  createdAt?: string;
  updatedAt?: string;
  rescatista?: {
    id?: string;
    nombre?: string;
    telefono?: string;
    fechaRescatista?: string;
    imagen?: string | null;
    geolocalizacionId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  geolocalizacion?: {
    id?: string;
    latitud?: number;
    longitud?: number;
    descripcion?: string;
    fechaRegistro?: string;
    createdAt?: string;
    updatedAt?: string;
  };
};

type ApiResponse =
  | { postgres: PostgresAnimal[] }   // como tu ejemplo
  | PostgresAnimal[];                // por si el endpoint devuelve array directo

/** ===== Util: mapea un registro Postgres → Pet ===== */
export function mapPostgresToPet(a: PostgresAnimal): Pet {
  // Imagen por defecto si viene null: se infiere por especie (muy simple)
  const fallbackImage = (() => {
    const e = (a.especie || "").toLowerCase();
    if (e.includes("can") || e.includes("perro") || e.includes("dog")) return "/dog.svg";
    if (e.includes("fel") || e.includes("gato") || e.includes("cat")) return "/cat.svg";
    if (e.includes("ave") || e.includes("pájaro") || e.includes("loro")) return "/bird.svg";
    return "/pet.svg";
  })();

  return {
    id: a.id,
    name: a.nombre,
    species: a.especie,
    breed: a.raza,
    image: a.imagen ?? fallbackImage,
    sex: a.sexo,
    age: typeof a.edad === "number" ? `${a.edad} ${a.edad === 1 ? "año" : "años"}` : undefined,
    healthStatus: a.estadoSalud,
    admissionDate: a.fechaRescate ?? undefined,
    feedingType: a.tipoAlimentacion,
    recommendedAmount: a.cantidadRecomendada,
    recommendedFrequency: a.frecuenciaRecomendada,
    releaseDate: "Pendiente",        // no existe en tu esquema → default
    releaseLocation: "Por determinar", // no existe en tu esquema → default
    tipo: a.tipo,
    rescuer: {
      id: a.rescatista?.id ?? a.rescatista_id,
      name: a.rescatista?.nombre,
      phone: a.rescatista?.telefono,
      rescueDate: a.fechaRescate,
      rescueLocation: a.ubicacionRescate ?? a.geolocalizacion?.descripcion,
    },
  };
}

/** ===== Hook: fetchea y entrega pets[] ===== */
export function usePets(endpoint = "/animales") {
  const [raw, setRaw] = useState<PostgresAnimal[] | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(endpoint, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiResponse = await res.json();
        const list = Array.isArray(data) ? data : data.postgres ?? [];
        if (!alive) return;
        setRaw(list);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error al cargar animales");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [endpoint]);

  const mapped = useMemo(() => (raw ?? []).map(mapPostgresToPet), [raw]);

  useEffect(() => { setPets(mapped); }, [mapped]);

  return { pets, loading, error };
}
