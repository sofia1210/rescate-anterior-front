// src/services/dataService.ts
import { api } from "../lib/api";

// Tipos opcionales (ajusta a tu backend si hace falta)
export interface Rescatista {
  _id?: string;
  id?: string | number;
  nombre: string;
  telefono: string;
  fechaRescatista: string; // yyyy-mm-dd
  ubicacionRescate?: string;
  descripcion?: string;
  latitud?: string;
  longitud?: string;
  imagenUrl?: string;
}

// Listados
export const getAllRescatistas = () => api.get("/rescatistas");

// Conveniencia: devolver siempre array de rescatistas ya desenvuelto
export const getRescatistasList = async () => {
  const r = await getAllRescatistas();
  const data = r?.data as any;
  return Array.isArray(data) ? data : (data?.postgres ?? []);
};
export const getAllAnimales = () => api.get("/animales");
export const getAllVeterinarios = () => api.get("/veterinarios");
export const getVeterinariosList = async () => {
  const r = await getAllVeterinarios();
  const data = r?.data as any;
  return Array.isArray(data) ? data : (data?.postgres ?? []);
};
export const createVeterinario = (data: { nombre: string; telefono: string; especialidad: string; email: string }) =>
  api.post("/veterinarios", data);
export const getAllAdopciones = () => api.get("/adopciones");
export const getAllAdoptions = () => api.get("/adoptions");
export const createAdopcion = (data: {
  nombreAnimal: string;
  estado: string; // "Aprobada" | "Pendiente" | "Rechazada"
  nombreAdoptante: string;
  contactoAdoptante: string;
  observaciones?: string;
  fechaAdopcion: string; // ISO
  latitud?: number;
  longitud?: number;
  descripcion?: string;
}) => api.post("/adoptions", data);

// Animales helpers
export const getAnimalById = async (id: string | number) => {
  const r = await api.get(`/animales/${id}`);
  const data = r?.data as any;
  return Array.isArray(data) ? (data[0] ?? null) : (data?.postgres ?? data);
};

// CRUD Rescatista
export const getRescatistaById = async (id: string) => {
  const r = await api.get(`/rescatistas/${id}`);
  const data = r?.data as any;
  return data?.postgres ?? data;
};

export const createRescatista = (formData: FormData) =>
  api.post<Rescatista>("/rescatistas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRescatista = (id: string, formData: FormData) =>
  api.put<Rescatista>(`/rescatistas/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteRescatista = (id: string) =>
  api.delete<{ deleted: boolean }>(`/rescatistas/${id}`);

export const upsertRescatista = (formData: FormData, id?: string) =>
  (id ? updateRescatista(id, formData) : createRescatista(formData));

// CRUD Animal (multipart, sin imagen por ahora)
export const createAnimal = (formData: FormData) =>
  api.post("/animales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAnimal = (id: string, formData: FormData) =>
  api.put(`/animales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAnimalStatus = (id: string, status: string) =>
  api.put(`/animales/${id}`, { estadoSalud: status });

export const deleteAnimal = (id: string) => api.delete(`/animales/${id}`);

// Evaluaciones (para veterinarios/etiquetas auxiliares)
export const getAllEvaluations = async () => {
  const r = await api.get("/evaluations");
  return r.data;
};

