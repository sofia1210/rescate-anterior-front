// src/services/dataService.ts
import { api } from "../lib/api";

// Interfaces para datos principales
export interface AnimalData {
  nombre: string;
  especie: string;
  raza: string;
  sexo: string;
  edad: number;
  estadoSalud: string;
  tipoAlimentacion: string;
  cantidadRecomendada: string;
  frecuenciaRecomendada: string;
  tipo: string;
  nombreRescatista: string;
  telefonoRescatista: string;
  fechaRescate: string;
  detallesRescate: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}

export interface RescatistaData {
  nombre: string;
  telefono: string;
  fechaRescatista: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}

export interface VeterinarioData {
  nombre: string;
  telefono: string;
  especialidad: string;
  email: string;
}

// Endpoints principales - Corregidos para coincidir con la API
export const getAllRescatistas = () => api.get("/rescatistas");
export const getAllAnimales = () => api.get("/animales");
export const getAllVeterinarios = () => api.get("/veterinarios");
export const getAllAdopciones = () => api.get("/adopciones");

// CRUD Rescatista - Actualizado para usar JSON
export const createRescatista = (data: RescatistaData) => {
  return api.post("/rescatistas", data);
};

export const updateRescatista = (id: string, data: RescatistaData) => {
  return api.put(`/rescatistas/${id}`, data);
};

export const deleteRescatista = (id: string) => {
  return api.delete(`/rescatistas/${id}`);
};

// CRUD Animal - Usa JSON según la API
export const createAnimal = (data: AnimalData) => {
  return api.post("/animales", data);
};

export const updateAnimal = (id: string, data: AnimalData) => {
  return api.put(`/animales/${id}`, data);
};

export const deleteAnimal = (id: string) => {
  return api.delete(`/animales/${id}`);
};

// CRUD Veterinario
export const createVeterinario = (data: VeterinarioData) => {
  return api.post("/veterinarios", data);
};

export const updateVeterinario = (id: string, data: VeterinarioData) => {
  return api.put(`/veterinarios/${id}`, data);
};

export const deleteVeterinario = (id: string) => {
  return api.delete(`/veterinarios/${id}`);
};
