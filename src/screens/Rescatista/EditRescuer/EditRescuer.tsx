import React, { useState, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { FormFieldWithError } from "../../../components/ui/form-field-with-error";
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
  onBack?: () => void;
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
  onBack,
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
  const [submitted, setSubmitted] = useState(false);
  // Se deshabilita la carga de foto del rescatista según requerimiento

  const minVolunteerAge = 17;
  const maxBirthDateTmp = new Date();
  maxBirthDateTmp.setFullYear(maxBirthDateTmp.getFullYear() - minVolunteerAge);
  const maxBirthDateStr = maxBirthDateTmp.toISOString().split("T")[0];
  const minBirthDateStr = "1900-01-01";

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
          // Foto deshabilitada: ya no se muestra preview ni se edita imagen
        } catch (e) {
          console.error("No se pudo cargar el rescatista:", e);
        }
      }
    };
    load();
  }, [isEditing, rescatistaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setIsSubmitting(true);

    try {
      // Validaciones del lado del cliente
      const trimmedName = formData.nombreRescatista.trim();
      const digitsOnlyPhone = formData.telefonoContacto.trim();
      const birthDateStr = formData.fechaRescate;

      if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,80}$/.test(trimmedName)) {
        const el = document.getElementById("field-nombre-del-rescatista");
        el?.focus();
        setIsSubmitting(false);
        return;
      }

      if (!/^\d{8,12}$/.test(digitsOnlyPhone)) {
        const el = document.getElementById("field-teléfono-de-contacto");
        el?.focus();
        setIsSubmitting(false);
        return;
      }

      if (!birthDateStr) {
        const el = document.getElementById("field-fecha-de-nacimiento-del-rescatista");
        el?.focus();
        setIsSubmitting(false);
        return;
      }

      const birthDate = new Date(birthDateStr);
      if (Number.isNaN(birthDate.getTime())) {
        const el = document.getElementById("field-fecha-de-nacimiento-del-rescatista");
        el?.focus();
        setIsSubmitting(false);
        return;
      }

      const todayDate = new Date();
      let age = todayDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = todayDate.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && todayDate.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < minVolunteerAge) {
        const el = document.getElementById("field-fecha-de-nacimiento-del-rescatista");
        el?.focus();
        setIsSubmitting(false);
        return;
      }

      // Si todas las validaciones pasan, construimos el payload
      const payload = new FormData();
      // Campos backend esperados (capitalizar)
      const toTitle = (s: string) => s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
      payload.append("nombre", toTitle(formData.nombreRescatista.trim()));
      payload.append("telefono", formData.telefonoContacto);
      // Convierte fecha yyyy-mm-dd → ISO si hace falta
      const iso = formData.fechaRescate && !formData.fechaRescate.includes("T")
        ? `${formData.fechaRescate}T10:00:00Z` : formData.fechaRescate;
      payload.append("fechaRescatista", iso);
      // Imagen deshabilitada: no se adjunta
      // En registro también se permiten coordenadas si el usuario marcó el mapa
      if (formData.latitud) payload.append("latitud", formData.latitud);
      if (formData.longitud) payload.append("longitud", formData.longitud);
      if (formData.ubicacionRescate) payload.append("ubicacionRescate", toTitle(formData.ubicacionRescate.trim()));
      if (formData.detallesRescate) payload.append("descripcion", toTitle(formData.detallesRescate.trim()));

      // Log visible del body
      console.log("[RESCATISTA] FormData →", Array.from(payload.entries()));

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => (onBack ? onBack() : onClose())} className="text-gray-500 hover:text-gray-700" type="button" aria-label="Volver">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h2 className="text-2xl">{isEditing ? "Editar Rescatista" : "Agregar Rescatista"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" type="button" aria-label="Cerrar">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldWithError
              label="Nombre del rescatista"
              value={formData.nombreRescatista}
              onChange={(v) => setFormData({ ...formData, nombreRescatista: v.replace(/\s{2,}/g, " ") })}
              minLength={2}
              maxLength={80}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\\s.'-]{2,80}$"
              placeholder="ej. Guillermo Soto"
              required
              validateMessage="Solo letras y espacios. 2 a 80 caracteres."
              forceValidate={submitted}
            />

            <FormFieldWithError
              label="Fecha de nacimiento del Rescatista"
              type="date"
              value={formData.fechaRescate}
              onChange={(v) => {
                const clamped = v > maxBirthDateStr ? maxBirthDateStr : v;
                setFormData({ ...formData, fechaRescate: clamped });
              }}
              min={minBirthDateStr}
              max={maxBirthDateStr}
              required
              validateMessage={`Debe ser una fecha válida. Mínimo ${minVolunteerAge} años.`}
              forceValidate={submitted}
            />

            <FormFieldWithError
              label="Teléfono de contacto"
              type="tel"
              inputMode="numeric"
              value={formData.telefonoContacto}
              onChange={(v) => setFormData({ ...formData, telefonoContacto: v.replace(/\D/g, "") })}
              pattern="^[0-9]{8,12}$"
              minLength={8}
              maxLength={12}
              placeholder="ej. 79958632"
              required
              validateMessage="Ingrese solo números (8 a 12 dígitos)."
              forceValidate={submitted}
            />

            <div className="flex items-end md:justify-end">
              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700 px-8 w-full md:w-auto shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  isEditing ? "Guardando..." : "Guardando..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {isEditing ? "Guardar Cambios" : "Guardar y Continuar"}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium mb-1">Ubicación del Rescate:</label>
              <Input type="text" value={formData.ubicacionRescate} readOnly required />
            </div>
          )}

          {/* Foto deshabilitada */}

          {isEditing && (
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
          )}

          {isEditing && formData.latitud && formData.longitud && (
            <div className="text-sm mt-2 text-gray-600">
              <p>
                <strong>Latitud:</strong> {formData.latitud}
              </p>
              <p>
                <strong>Longitud:</strong> {formData.longitud}
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
