import { api } from "../lib/api";

// Interfaces para Evaluaciones Médicas
export interface EvaluationData {
  nombreAnimal: string;
  diagnostico: string;
  sintomas?: string;
  medicacion?: string;
  responsableNombre: string;
  fechaEvaluacion: string;
  proximaRevision?: string;
}

// Interfaces para Tratamientos
export interface TreatmentData {
  nombreAnimal: string;
  tratamiento: string;
  duracion: string;
  observaciones?: string;
  responsableNombre: string;
  fechaTratamiento: string;
}

// Evaluaciones Médicas
export const createEvaluation = (data: EvaluationData) => {
  return api.post("/evaluations", data);
};

export const getAllEvaluations = () => {
  return api.get("/evaluations");
};

export const getEvaluationByAnimal = (animalName: string) => {
  return api.get(`/evaluations?nombreAnimal=${animalName}`);
};

// Tratamientos
export const createTreatment = (data: TreatmentData) => {
  return api.post("/tratamientos", data);
};

export const getAllTreatments = () => {
  return api.get("/tratamientos");
};

export const getTreatmentByAnimal = (animalName: string) => {
  return api.get(`/tratamientos?nombreAnimal=${animalName}`);
};
