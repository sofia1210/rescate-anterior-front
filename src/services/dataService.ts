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
export const getAllRescatistas = () => api.get<Rescatista[]>("/rescatistas");
export const getAllAnimales = () => api.get("/animales");
export const getAllVeterinarios = () => api.get("/veterinarios");
export const getAllAdopciones = () => api.get("/adopciones");

// CRUD Rescatista
export const getRescatistaById = (id: string) =>
  api.get<Rescatista>(`/rescatistas/${id}`).then((r) => r.data);

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

export const deleteAnimal = (id: string) => api.delete(`/animales/${id}`);

