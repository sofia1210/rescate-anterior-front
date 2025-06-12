// src/services/dataService.ts
import { api } from "../lib/api";

// MongoDB
export const getAllRescatistas = () => api.get("/rescatistas/getAll");
export const getAllAnimales = () => api.get("/animales/getAll");

// PL/SQL
export const getAllVeterinarios = () => api.get("/veterinarios/getAll");
export const getAllAdopciones = () => api.get("/adopciones/getAll");

// CRUD Rescatista
export const createRescatista = (formData: FormData) =>
  api.post("/rescatistas", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateRescatista = (id: string, formData: FormData) =>
  api.put(`/rescatistas/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// CRUD Animal
export const createAnimal = (formData: FormData) =>
  api.post("/animales", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateAnimal = (id: string, formData: FormData) =>
  api.put(`/animales/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
