// usePets.ts
"use client";
import { useEffect, useState } from "react";
import { getAllEvaluations } from "./dataService";
import { api } from "../lib/api";

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
  veterinarian?: {
    id?: string;
    name?: string;
    phone?: string;
    email?: string;
    especialidad?: string;
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
  const normalize = (s: string | undefined | null) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const tipoNorm = normalize(a.tipo);
  const tipoUnified = tipoNorm === "domestico" ? "domestico" : tipoNorm === "silvestre" ? "silvestre" : (a.tipo || "");

  return {
    id: a.id,
    name: a.nombre,
    species: a.especie,
    breed: a.raza,
    // Guarda solo el nombre de archivo; el front armará `${API_BASE_URL}/uploads/<nombre>`
    image: a.imagen ? String(a.imagen).split("/").pop() || String(a.imagen) : null,
    sex: a.sexo,
    age: typeof a.edad === "number" ? `${a.edad} ${a.edad === 1 ? "año" : "años"}` : undefined,
    healthStatus: a.estadoSalud,
    admissionDate: a.fechaRescate ?? undefined,
    feedingType: a.tipoAlimentacion,
    recommendedAmount: a.cantidadRecomendada,
    recommendedFrequency: a.frecuenciaRecomendada,
    releaseDate: "Pendiente",        // no existe en tu esquema → default
    releaseLocation: "Por determinar", // no existe en tu esquema → default
    tipo: tipoUnified,
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
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        
        // Obtener animales via service client
        const res = await api.get(endpoint);
        const data: ApiResponse = res.data as any;
        const list = Array.isArray(data) ? data : data.postgres ?? [];
        
        if (!alive) return;
        
        // Mapear animales básicos primero
        const mappedPets = list.map(mapPostgresToPet);
        
        // Intentar obtener evaluaciones médicas para verificar veterinarios
        try {
          const evaluations = await getAllEvaluations();
          if (Array.isArray(evaluations)) {
            
            // Agregar información de veterinario si existe
            mappedPets.forEach(pet => {
              const animalEvaluations = evaluations.filter((evaluation: any) => 
                evaluation.nombreAnimal === pet.name
              );
              
              if (animalEvaluations.length > 0) {
                const latestEvaluation = animalEvaluations[0];
                pet.veterinarian = {
                  name: latestEvaluation.responsableNombre || "Veterinario Asignado",
                  especialidad: "Medicina Veterinaria"
                };
              }
            });
          }
        } catch (e) {
          console.warn("No se pudieron cargar las evaluaciones médicas:", e);
        }
        
        setPets(mappedPets);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message ?? "Error al cargar animales");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [endpoint]);

  return { pets, loading, error };
}
