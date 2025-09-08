import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import {
  createRescatista,
  updateRescatista,
  getRescatistaById,
} from "../../../services/dataService";

interface EditRescuerProps {
  onClose: () => void;
  onSuccess?: (rescuerData: { id: string | number; fechaRescate: string; nombre?: string; telefono?: string }) => void;
  isEditing?: boolean;
  rescatistaId?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const mapContainerStyle = { width: "100%", height: "300px" };
const defaultCenter = { lat: -17.7833, lng: -63.1821 };

export const EditRescuer = ({
  onClose,
  onSuccess,
  isEditing = false,
  rescatistaId,
}: EditRescuerProps): JSX.Element => {
  const [formData, setFormData] = useState({
    nombreRescatista: "",
    telefonoContacto: "",
    fechaRescate: "",
    ubicacionRescate: "",
    detallesRescate: "",
    latitud: "",
    longitud: "",
  });
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const handleMapClick = async (event: google.maps.MapMouseEvent) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setMarkerPosition({ lat, lng });
      setFormData((prev) => ({ ...prev, latitud: lat.toString(), longitud: lng.toString() }));

      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { location: { lat, lng } },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === "OK" && results && results[0]) {
            setFormData((prev) => ({ ...prev, ubicacionRescate: results[0].formatted_address }));
          }
        }
      );
    }
  };

  // Carga para edición
  useEffect(() => {
    const load = async () => {
      if (isEditing && rescatistaId) {
        try {
          const r = await getRescatistaById(rescatistaId);
          setFormData({
            nombreRescatista: r.nombre || "",
            telefonoContacto: r.telefono || "",
            fechaRescate: r.fechaRescatista || "",
            ubicacionRescate: r.ubicacionRescate || "",
            detallesRescate: r.descripcion || "",
            latitud: r.latitud || "",
            longitud: r.longitud || "",
          });
          if (r.latitud && r.longitud) {
            setMarkerPosition({ lat: parseFloat(r.latitud), lng: parseFloat(r.longitud) });
          }
        } catch (e) {
          console.error("No se pudo cargar el rescatista:", e);
        }
      }
    };
    load();
  }, [isEditing, rescatistaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("nombre", formData.nombreRescatista);
      payload.append("telefono", formData.telefonoContacto);
      payload.append("fechaRescatista", formData.fechaRescate);
      // No enviar imagen desde el front
      payload.append("latitud", formData.latitud);
      payload.append("longitud", formData.longitud);
      payload.append("descripcion", formData.detallesRescate);
      payload.append("ubicacionRescate", formData.ubicacionRescate);

      // EDIT vs CREATE
      if (isEditing && rescatistaId) {
        await updateRescatista(rescatistaId, payload);
        onSuccess?.({ id: rescatistaId, fechaRescate: formData.fechaRescate, nombre: formData.nombreRescatista, telefono: formData.telefonoContacto });
      } else {
        const resp = await createRescatista(payload);
        const created: any = resp?.data;
        const newId = created?.id ?? created?._id ?? created?.rescatistaId ?? "";
        onSuccess?.({ id: newId, fechaRescate: formData.fechaRescate, nombre: formData.nombreRescatista, telefono: formData.telefonoContacto });
      }
      onClose();
    } catch (error) {
      console.error("Error al guardar rescatista:", error);
      alert("Hubo un problema guardando el rescatista.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-6 sticky top-0 bg-white z-10 pb-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" type="button" aria-label="Volver">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl">{isEditing ? "Editar Rescatista" : "Agregar Rescatista"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del rescatista:</label>
                <Input
                  type="text"
                  value={formData.nombreRescatista}
                  onChange={(e) => setFormData({ ...formData, nombreRescatista: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono de contacto:</label>
                <Input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formData.telefonoContacto}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, telefonoContacto: value });
                  }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fecha de nacimiento del Rescatista:</label>
                <Input
                  type="date"
                  max={today}
                  value={formData.fechaRescate}
                  onChange={(e) => setFormData({ ...formData, fechaRescate: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ubicación del Rescate:</label>
                <Input type="text" value={formData.ubicacionRescate} readOnly required />
              </div>

              <LoadScript
                googleMapsApiKey={(import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "AIzaSyCl9B-64vdVOiZTBQOIVUEX7RVFW4Wr_BE"}
                libraries={["places"]}
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={markerPosition || defaultCenter}
                  zoom={13}
                  onClick={handleMapClick}
                >
                  {markerPosition && <Marker position={markerPosition} />}
                </GoogleMap>
              </LoadScript>

              {formData.latitud && formData.longitud && (
                <div className="text-sm mt-2 text-gray-600">
                  <p>
                    <strong>Latitud:</strong> {formData.latitud}
                  </p>
                  <p>
                    <strong>Longitud:</strong> {formData.longitud}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Detalles del Rescate (opcional):</label>
                <textarea
                  rows={3}
                  value={formData.detallesRescate}
                  onChange={(e) => setFormData({ ...formData, detallesRescate: e.target.value })}
                  className="w-full border rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="space-y-4" />
          </div>

          <div className="flex justify-center sticky bottom-0 bg-white pt-4">
            <Button
              type="submit"
              className="bg-green-500 text-white hover:bg-green-600 px-8"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditing ? "GUARDANDO..." : "GUARDANDO...")
                : (isEditing ? "GUARDAR CAMBIOS" : "GUARDAR Y CONTINUAR")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
