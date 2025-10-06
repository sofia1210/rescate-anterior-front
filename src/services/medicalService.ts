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
  sintomas: string;
  duracion: string;
  observaciones?: string;
  responsableNombre: string;
  fechaTratamiento: string;
}

// Evaluaciones Médicas
export const createEvaluation = (data: EvaluationData) => {
  // Asegurar ISO para fechas
  const payload = {
    nombreAnimal: data.nombreAnimal,
    diagnostico: data.diagnostico,
    sintomas: data.sintomas || undefined,
    medicacion: data.medicacion || undefined,
    responsableNombre: data.responsableNombre,
    fechaEvaluacion: new Date(data.fechaEvaluacion).toISOString(),
    proximaRevision: data.proximaRevision ? new Date(data.proximaRevision).toISOString() : undefined,
  };
  return api.post("/evaluations", payload);
};

export const getAllEvaluations = () => {
  return api.get("/evaluations");
};

export const getEvaluationByAnimal = (animalName: string) => {
  return api.get(`/evaluations?nombreAnimal=${animalName}`);
};

// Tratamientos
export const createTreatment = (data: TreatmentData) => {
  const payload = {
    nombreAnimal: data.nombreAnimal,
    tratamiento: data.tratamiento,
    sintomas: data.sintomas,
    duracion: data.duracion,
    observaciones: data.observaciones || undefined,
    responsableNombre: data.responsableNombre,
    fechaTratamiento: new Date(data.fechaTratamiento).toISOString(),
  };
  return api.post("/tratamientos", payload);
};

export const getAllTreatments = () => {
  return api.get("/tratamientos");
};

export const getTreatmentByAnimal = (animalName: string) => {
  return api.get(`/tratamientos?nombreAnimal=${animalName}`);
};
