import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useNavigate } from "react-router-dom";
import { createAnimal } from "../../../services/dataService";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface AddAnimalProps {
  onClose: () => void;
  rescuerId?: string | null;
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
  imagen: File | null;
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
}: AddAnimalProps): JSX.Element => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    tipo: "",
    especie: "",
    raza: "",
    sexo: "",
    estadoSalud: "",
    tipoAlimentacion: "",
    cantidadRecomendada: "",
    frecuenciaRecomendada: "",
    fechaRescate: "",
    ubicacionRescate: "",
    latitud: "",
    longitud: "",
    imagen: null,
  });

  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const dataToSend = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== "imagen") {
          dataToSend.append(key, value);
        }
      });

      if (formData.imagen) {
        dataToSend.append("imagen", formData.imagen);
      }

      if (rescuerId) {
        dataToSend.append("rescatistaId", rescuerId);
      }

      const response = await createAnimal(dataToSend);
      console.log("✅ Animal registrado:", response.data);
      onClose();
    } catch (error) {
      console.error("❌ Error al registrar el animal:", error);
      alert("Hubo un problema al registrar el animal. Revisá la consola.");
    }
  };

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
            <LoadScript googleMapsApiKey="AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={markerPosition || center}
                zoom={13}
                onClick={handleMapClick}
              >
                {markerPosition && <Marker position={markerPosition} />}
              </GoogleMap>
            </LoadScript>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Foto:</label>
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                {formData.imagen ? (
                  <img
                    src={URL.createObjectURL(formData.imagen)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-24 w-24 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    imagen: e.target.files?.[0] || null,
                  })
                }
                className="w-full"
              />
            </div>
          </div>
          <div className="md:col-span-2 mt-8 flex justify-center">
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 px-8"
            >
              AGREGAR ANIMAL
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
