import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

interface AddAnimalProps {
  onClose: () => void;
  rescuerId?: string | null;
  onSuccess?: () => void;
  isEditing?: boolean;
  initialAnimal?: {
    id?: string | number;
    name?: string;
    species?: string;
    breed?: string;
    sex?: string;
    healthStatus?: string;
    feedingType?: string;
    recommendedAmount?: string;
    recommendedFrequency?: string;
    admissionDate?: string;
    tipo?: string;
    rescuer?: { id?: string };
  } | null;
  selectedRescuer?: {
    id?: string;
    _id?: string;
    nombre?: string;
    telefono?: string;
    fechaRescatista?: string;
  } | null;
}

declare global {
  interface Window {
    google: any;
  }
}

type TipoAnimal = "silvestre" | "doméstico" | "";

interface FormData {
  nombre: string;
  tipo: TipoAnimal;
  especie: string;
  raza: string;
  sexo: string;
  estadoSalud: string;
  tipoAlimentacion: string;
  cantidadRecomendada: string;
  frecuenciaRecomendada: string;
  fechaRescate: string;
  ubicacionRescate: string;
  latitud: string;
  longitud: string;
}

const mapContainerStyle = {
  width: "100%",
  height: "250px",
};

const center = {
  lat: -17.7833,
  lng: -63.1821,
};

export const AddAnimal = ({
  onClose,
  rescuerId,
  onSuccess,
  isEditing = false,
  initialAnimal = null,
  selectedRescuer = null,
}: AddAnimalProps): JSX.Element => {
  const today = new Date().toISOString().split("T")[0];

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE",
    libraries: ["places"],
  });

  const [formData, setFormData] = useState<FormData>({
    nombre: initialAnimal?.name || "",
    tipo: initialAnimal?.tipo === "domestico" ? "doméstico" : initialAnimal?.tipo === "silvestre" ? "silvestre" : "",
    especie: initialAnimal?.species || "",
    raza: initialAnimal?.breed || "",
    sexo: initialAnimal?.sex || "",
    estadoSalud: initialAnimal?.healthStatus || "",
    tipoAlimentacion: initialAnimal?.feedingType || "",
    cantidadRecomendada: initialAnimal?.recommendedAmount || "",
    frecuenciaRecomendada: initialAnimal?.recommendedFrequency || "",
    fechaRescate: (initialAnimal?.admissionDate || "").split("T")[0] || "",
    ubicacionRescate: "",
    latitud: "",
    longitud: "",
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData((prev) => ({
        ...prev,
        latitud: lat.toString(),
        longitud: lng.toString(),
      }));

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
          if (status === "OK" && results && results[0]) {
            setFormData((prev) => ({
              ...prev,
              ubicacionRescate: results[0].formatted_address,
            }));
          }
        }
      );
    }
  };

  // ...existing code...
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Validación mínima de coordenadas (mapa)
  if (!formData.latitud || !formData.longitud) {
    alert("Por favor seleccioná una ubicación en el mapa (latitud/longitud).");
    return;
  }

  // Mapea los datos del formulario al formato requerido
  const animalData: Record<string, any> = {
    nombre: formData.nombre,
    especie: formData.especie,
    raza: formData.raza,
    sexo: formData.sexo,
    edad: 3, // Puedes agregar un campo de edad en el formulario si lo necesitas
    estadoSalud: formData.estadoSalud,
    tipoAlimentacion: formData.tipoAlimentacion,
    cantidadRecomendada: formData.cantidadRecomendada,
    frecuenciaRecomendada: formData.frecuenciaRecomendada,
    // Backend espera valores capitalizados según ejemplo ("Doméstico"|"Silvestre")
    tipo: formData.tipo === "doméstico" ? "Doméstico" : "Silvestre",
    // Vincular con el rescatista seleccionado
    rescatista_id: rescuerId ?? undefined,
    fechaRescate: formData.fechaRescate + "T10:00:00Z", // Ajusta si tienes hora
    detallesRescate: "Encontrado en parque", // Puedes obtenerlo del formulario
    latitud: parseFloat(formData.latitud),
    longitud: parseFloat(formData.longitud),
    descripcion: formData.ubicacionRescate,
    ubicacionRescate: formData.ubicacionRescate,
  };
  // Nota: evitamos enviar objeto rescatista anidado; el backend puede resolverlo por rescatista_id
  // Compatibilidad: algunos endpoints esperan los campos del rescatista por nombre/teléfono/fecha
  if (selectedRescuer) {
    if (selectedRescuer.nombre) animalData.nombreRescatista = selectedRescuer.nombre;
    if (selectedRescuer.telefono) animalData.telefonoRescatista = selectedRescuer.telefono;
    if (selectedRescuer.fechaRescatista) animalData.fechaRescatista = selectedRescuer.fechaRescatista;
  }

  try {
    const base = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/animales` : "/animales";
    const url = isEditing && initialAnimal?.id ? `${base}/${initialAnimal.id}` : base;
    const method = isEditing && initialAnimal?.id ? "PUT" : "POST";

    const fd = new FormData();
    Object.entries(animalData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        fd.append(key, typeof value === "number" ? String(value) : (value as string));
      }
    });
    // Imagen opcional
    if (imagenFile) {
      const safeName = `${Date.now()}_${imagenFile.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_\.-]/g, "")}`;
      const renamedFile = new File([imagenFile], safeName, { type: imagenFile.type });
      fd.append("imagen", renamedFile);
      fd.append("imagenNombre", safeName);
      fd.append("imagenPath", `/uploads/${safeName}`);
    }

    const response = await fetch(url, {
      method,
      body: fd,
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend respondió:", response.status, errorText);
      throw new Error(`Error en el registro (HTTP ${response.status})`);
    }
    const data = await response.json();
    console.log("✅ Animal registrado:", data);
    onClose();
    onSuccess?.();
  } catch (error) {
    console.error("❌ Error al registrar el animal:", error);
    alert("Hubo un problema al registrar el animal. Revisá la consola.");
  }
};
// ...existing code...

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white z-[9999] pb-4">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <h2 className="text-2xl font-semibold">Datos del Animal</h2>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <div className="space-y-4">
            <InputField
              label="Nombre"
              value={formData.nombre}
              onChange={(v) => setFormData({ ...formData, nombre: v })}
            />
            <DropdownField
              label="Tipo"
              value={formData.tipo}
              onChange={(v) =>
                setFormData({ ...formData, tipo: v as TipoAnimal })
              }
              options={["doméstico", "silvestre"]}
            />
            <InputField
              label="Especie"
              value={formData.especie}
              onChange={(v) => setFormData({ ...formData, especie: v })}
            />
            <InputField
              label="Raza"
              value={formData.raza}
              onChange={(v) => setFormData({ ...formData, raza: v })}
            />
            <DropdownField
              label="Sexo"
              value={formData.sexo}
              onChange={(v) => setFormData({ ...formData, sexo: v })}
              options={["macho", "hembra"]}
            />
            <DropdownField
              label="Estado de Salud"
              value={formData.estadoSalud}
              onChange={(v) => setFormData({ ...formData, estadoSalud: v })}
              options={["muy bueno", "bueno", "estable", "malo", "muy malo"]}
            />
            <DropdownField
              label="Tipo de Alimentación"
              value={formData.tipoAlimentacion}
              onChange={(v) =>
                setFormData({ ...formData, tipoAlimentacion: v })
              }
              options={["carnivoro", "herviboro", "insectivoro", "omnivoro"]}
            />
            <DropdownField
              label="Cantidad Recomendada"
              value={formData.cantidadRecomendada}
              onChange={(v) =>
                setFormData({ ...formData, cantidadRecomendada: v })
              }
              options={["diaria", "semanal", "mensual"]}
            />
            <DropdownField
              label="Frecuencia Recomendada"
              value={formData.frecuenciaRecomendada}
              onChange={(v) =>
                setFormData({ ...formData, frecuenciaRecomendada: v })
              }
              options={["1kg", "2kg", "3kg", "4kg"]}
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Rescate:
              </label>
              <Input
                type="date"
                value={formData.fechaRescate}
                max={today}
                onChange={(e) =>
                  setFormData({ ...formData, fechaRescate: e.target.value })
                }
                className="w-full"
                required
              />
            </div>
            <InputField
              label="Ubicación del Rescate"
              value={formData.ubicacionRescate}
              onChange={(v) =>
                setFormData({ ...formData, ubicacionRescate: v })
              }
            />
            <div className="flex gap-4 text-sm">
              <span>Latitud: {formData.latitud}</span>
              <span>Longitud: {formData.longitud}</span>
            </div>
            {isLoaded && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPosition || center}
                zoom={13}
                onClick={handleMapClick}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Foto del Animal (opcional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImagenFile(file);
                  setImagenPreview(file ? URL.createObjectURL(file) : "");
                }}
                className="w-full"
              />
              {imagenPreview && (
                <div className="mt-2">
                  <img src={imagenPreview} alt="Preview" className="h-32 w-32 object-cover rounded" />
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 px-8"
            >
              {isEditing ? "GUARDAR CAMBIOS" : "AGREGAR ANIMAL"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}:</label>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
      required
    />
  </div>
);

const DropdownField = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}:</label>
    <select
      className="w-full border rounded px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">Selecciona una opción</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
        </option>
      ))}
    </select>
  </div>
);
