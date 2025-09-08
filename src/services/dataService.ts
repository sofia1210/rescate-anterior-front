// src/services/dataService.ts
import { api } from "../lib/api";

/** ===== Tipos opcionales (útiles en TS, ajusta a tu backend) ===== */
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

/** =================== MongoDB =================== */
export const getAllRescatistas = () =>
  api.get<Rescatista[]>("/rescatistas/getAll");

// PostgreSQL endpoint
export const getAllRescatistasPg = () =>
  api.get<Rescatista[]>("/rescatistas");

export const getAllAnimales = () =>
  api.get("/animales/getAll");

/** =================== PL/SQL ==================== */
export const getAllVeterinarios = () =>
  api.get("/veterinarios/getAll");

export const getAllAdopciones = () =>
  api.get("/adopciones/getAll");

/** =============== CRUD Rescatista =============== */
// src/services/dataService.ts
export const getRescatistaById = (id: string) =>
  api.get<Rescatista>(`/rescatistas/${id}`).then(r => r.data);

export const createRescatista = (formData: FormData) =>
  api.post<Rescatista>("/rescatistas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRescatista = (id: string, formData: FormData) =>
  api.put<Rescatista>(`/rescatistas/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Si tu backend necesita method override (por ejemplo, Laravel):
// export const updateRescatista = (id: string, formData: FormData) => {
//   const fd = new FormData();
//   for (const [k, v] of formData.entries()) fd.append(k, v);
//   fd.append("_method", "PUT");
//   return api.post<Rescatista>(`/rescatistas/${id}`, fd, {
//     headers: { "Content-Type": "multipart/form-data" },
//   });
// };

export const deleteRescatista = (id: string) =>
  api.delete<{ deleted: boolean }>(`/rescatistas/${id}`);

/** Helper: crea o actualiza según haya id */
export const upsertRescatista = (formData: FormData, id?: string) =>
  id ? updateRescatista(id, formData) : createRescatista(formData);

/** ================ CRUD Animal ================= */
export const createAnimal = (formData: FormData) =>
  api.post("/animales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAnimal = (id: string, formData: FormData) =>
  api.put(`/animales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
