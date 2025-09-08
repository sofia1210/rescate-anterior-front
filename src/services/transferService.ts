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
