import { api } from "../lib/api";

// Interfaces para Transferencias/Traslados
export interface TransferData {
  nombreAnimal: string;
  motivo: string;
  observaciones?: string;
  responsable: string;
  fechaTraslado: string;
  latitudAnterior: number;
  longitudAnterior: number;
  descripcionAnterior: string;
  latitudNueva: number;
  longitudNueva: number;
  descripcionNueva: string;
}

// Interfaces para Liberaciones
export interface LiberationData {
  nombreAnimal: string;
  fechaLiberacion: string;
  observaciones?: string;
  latitud: number;
  longitud: number;
  descripcion: string;
}

// Transferencias/Traslados
export const createTransfer = (data: TransferData) => {
  return api.post("/transfers", data);
};

export const getAllTransfers = () => {
  return api.get("/transfers");
};

export const getTransferByAnimal = (animalName: string) => {
  return api.get(`/transfers?nombreAnimal=${animalName}`);
};

// Nuevos endpoints según práctica recomendada
export const getUltimaUbicacion = (animalId: string) => api.get(`/transfers/ultima-ubicacion/${encodeURIComponent(animalId)}`);
export const getTracking = (animalId: string) => api.get(`/transfers/${encodeURIComponent(animalId)}`);
export const getGeolocalizacionById = (geoId: string) => api.get(`/geolocalizaciones/${encodeURIComponent(geoId)}`);

// Geolocalizaciones: consulta por animal y creación
export const getAllGeolocalizaciones = () => api.get(`/geolocalizaciones`);
export const getGeolocalizacionesByAnimal = (animalId: string) => api.get(`/geolocalizaciones?animalId=${encodeURIComponent(animalId)}`);
export const createGeolocalizacion = (data: { animalId: string; latitud: number; longitud: number; descripcion?: string; fechaRegistro?: string }) => api.post(`/geolocalizaciones`, data);

// Liberaciones
export const createLiberation = (data: LiberationData) => {
  return api.post("/liberaciones", data);
};

export const getAllLiberations = () => {
  return api.get("/liberaciones");
};

export const getLiberationByAnimal = (animalName: string) => {
  return api.get(`/liberaciones?nombreAnimal=${animalName}`);
};
