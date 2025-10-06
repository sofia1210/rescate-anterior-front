import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formats a datetime-local string as ISO with a fixed offset, e.g., UTC-4 => offsetMinutes = -240
export function toIsoWithOffset(dateTimeLocal: string, offsetMinutes: number): string {
  if (!dateTimeLocal) return new Date().toISOString();
  // dateTimeLocal is "YYYY-MM-DDTHH:mm" or with seconds
  const [datePart, timePart = "00:00"] = dateTimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map((s) => parseInt(s, 10));
  const [hh, mm] = timePart.split(":" ).map((s) => parseInt(s, 10));
  // Build a Date in UTC from components, then apply offset to build the target wall time in that offset
  const utcMillis = Date.UTC(year, (month || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0);
  // We want an ISO string that encodes the specified offset, not 'Z'
  // Create the target time by subtracting the offset to get the equivalent UTC instant
  const instant = new Date(utcMillis - offsetMinutes * 60 * 1000); // shift by offset

  const pad = (n: number) => String(n).padStart(2, "0");
  const y = instant.getUTCFullYear();
  const m = pad(instant.getUTCMonth() + 1);
  const d = pad(instant.getUTCDate());
  const H = pad(instant.getUTCHours());
  const M = pad(instant.getUTCMinutes());
  const S = pad(instant.getUTCSeconds());

  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const offH = pad(Math.floor(abs / 60));
  const offM = pad(abs % 60);
  return `${y}-${m}-${d}T${H}:${M}:${S}${sign}${offH}:${offM}`;
}

// Returns a value suitable for <input type="datetime-local" /> as local time (YYYY-MM-DDTHH:mm)
export function getLocalDateTimeInputValue(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const H = pad(date.getHours());
  const M = pad(date.getMinutes());
  return `${y}-${m}-${d}T${H}:${M}`;
}

// Fecha mínima para veterinario (5 días atrás desde hoy)
export function getMinVetDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 5);
  return date.toISOString().split('T')[0];
}

// Fecha máxima para veterinario (hoy)
export function getMaxVetDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Fecha mínima para tratamiento (5 días atrás desde hoy)
export function getMinTreatmentDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 5);
  return date.toISOString().split('T')[0];
}

// Fecha máxima para tratamiento (hoy)
export function getMaxTreatmentDate(): string {
  return new Date().toISOString().split('T')[0];
}

// Fecha mínima para próxima revisión (mañana)
export function getMinNextReviewDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

// Fecha máxima para próxima revisión (1 mes desde hoy)
export function getMaxNextReviewDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

// Formats any date-like input into "DD/MM/YYYY HH:mm" at a fixed offset (e.g., -240 for UTC-4)
export function formatDateWithOffset(dateInput: string | number | Date, offsetMinutes: number): string {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "";

  // Convert to instant, then create a UTC date adjusted by offset
  const instantMs = date.getTime();
  const shifted = new Date(instantMs - offsetMinutes * 60 * 1000);

  const pad = (n: number) => String(n).padStart(2, "0");
  const dd = pad(shifted.getUTCDate());
  const mm = pad(shifted.getUTCMonth() + 1);
  const yyyy = shifted.getUTCFullYear();
  const h24 = shifted.getUTCHours();
  const minutes = pad(shifted.getUTCMinutes());
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  const hour = String(h12);
  return `${dd}/${mm}/${yyyy} ${hour}:${minutes}`;
}