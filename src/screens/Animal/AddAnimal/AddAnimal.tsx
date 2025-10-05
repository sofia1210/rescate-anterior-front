import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { FormFieldWithError } from "../../../components/ui/form-field-with-error";
// import { Breadcrumbs } from "../../../components/ui/breadcrumbs";
import { Notification } from "../../../components/ui/notification";
import { MapHelpModal } from "../../../components/ui/map-help";
// Leaflet map (using global L from CDN)

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

declare global { interface Window { L: any } }

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

const mapContainerStyle = { width: "100%", height: "250px" } as const;

const center = { lat: -17.7833, lng: -63.1821 } as const;

export const AddAnimal = ({
  onClose,
  rescuerId,
  onSuccess,
  isEditing = false,
  initialAnimal = null,
  selectedRescuer = null,
}: AddAnimalProps): JSX.Element => {
  const today = new Date().toISOString().split("T")[0];

  // refs para Leaflet
  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

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

  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string>("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showMapHelp, setShowMapHelp] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const requestCurrentLocation = React.useCallback(() => {
    if (!navigator.geolocation) {
      setNotification({ type: 'error', message: 'Tu navegador no soporta geolocalización.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        try { mapRef.current?.setView([lat, lng], 16); } catch {}
        setMarkerPosition({ lat, lng });
        setFormData((prev) => ({ ...prev, latitud: String(lat), longitud: String(lng) }));
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
          const r = await fetch(url);
          const j = await r.json();
          const name = j?.display_name as string | undefined;
          if (name) setFormData((prev) => ({ ...prev, ubicacionRescate: name }));
        } catch {}
      },
      (err) => {
        const reason = err?.code === 1 ? 'Permiso denegado para acceder a la ubicación' : 'No se pudo obtener tu ubicación';
        setNotification({ type: 'error', message: `${reason}. Puedes seleccionar el punto manualmente en el mapa.` });
        try { mapRef.current?.setZoom(14); } catch {}
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, []);

  React.useEffect(() => {
    const L: any = (window as any).L;
    const container = document.getElementById('add-animal-map');
    if (!L || !container) return;
    if (!mapRef.current) {
      mapRef.current = L.map('add-animal-map').setView([center.lat, center.lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mapRef.current);
      mapRef.current.on('click', handleLeafletClick);

      // Intentar centrar en ubicación real del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            mapRef.current.setView([lat, lng], 16);
            setMarkerPosition({ lat, lng });
            setFormData((prev) => ({ ...prev, latitud: String(lat), longitud: String(lng) }));
            (async () => {
              try {
                const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
                const r = await fetch(url);
                const j = await r.json();
                const name = j?.display_name as string | undefined;
                if (name) setFormData((prev) => ({ ...prev, ubicacionRescate: name }));
              } catch {}
            })();
          },
          () => {
            // Sin permiso: aplica un zoom amigable al centro por defecto
            try { mapRef.current.setZoom(14); } catch {}
          },
          { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
        );
      } else {
        try { mapRef.current.setZoom(14); } catch {}
      }
    }
    if (markerPosition && mapRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([markerPosition.lat, markerPosition.lng]);
      } else {
        markerRef.current = L.marker([markerPosition.lat, markerPosition.lng]).addTo(mapRef.current);
      }
    }
  }, [markerPosition]);

  const handleLeafletClick = async (e: any) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    setMarkerPosition({ lat, lng });
    setFormData((prev) => ({ ...prev, latitud: String(lat), longitud: String(lng) }));
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`;
      const r = await fetch(url);
      const j = await r.json();
      const name = j?.display_name as string | undefined;
      if (name) setFormData((prev) => ({ ...prev, ubicacionRescate: name }));
    } catch {}
  };

  // ...existing code...
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitted(true);
  // Validación simple: lat/long deben existir
  if (!formData.latitud || !formData.longitud) {
    setNotification({ type: 'error', message: 'Selecciona la ubicación en el mapa o usa tu ubicación.' });
    return;
  }

  // Helper: capitaliza cada palabra
  const toTitle = (s: string) => s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

  // Mapea los datos del formulario al formato requerido
  const animalData: Record<string, any> = {
    nombre: toTitle(formData.nombre.trim()),
    especie: toTitle(formData.especie.trim()),
    raza: formData.raza ? toTitle(formData.raza.trim()) : "",
    sexo: toTitle(formData.sexo.trim()),
    edad: 3, // Puedes agregar un campo de edad en el formulario si lo necesitas
    estadoSalud: toTitle(formData.estadoSalud.trim()),
    tipoAlimentacion: toTitle(formData.tipoAlimentacion.trim()),
    cantidadRecomendada: formData.cantidadRecomendada.trim(),
    frecuenciaRecomendada: toTitle(formData.frecuenciaRecomendada.trim()),
    // Backend espera valores capitalizados según ejemplo ("Doméstico"|"Silvestre")
    tipo: formData.tipo === "doméstico" ? "Doméstico" : "Silvestre",
    // Vincular con el rescatista seleccionado
    rescatista_id: rescuerId ?? undefined,
    fechaRescate: formData.fechaRescate + "T10:00:00Z", // Ajusta si tienes hora
    detallesRescate: "Encontrado en parque", // Puedes obtenerlo del formulario
    latitud: parseFloat(formData.latitud),
    longitud: parseFloat(formData.longitud),
    descripcion: formData.ubicacionRescate ? toTitle(formData.ubicacionRescate.trim()) : "",
    ubicacionRescate: formData.ubicacionRescate ? toTitle(formData.ubicacionRescate.trim()) : "",
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
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header estilo AnimalDetails */}
        <div className="bg-white z-20 border-b border-green-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">Datos del animal a registrar</h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>Completa los campos obligatorios marcados con *</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumbs removidos para simplificar el header del modal */}

        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-6"
          >
          <div className="space-y-4">
            <FormFieldWithError
              label="Nombre"
              value={formData.nombre}
              onChange={(v) => setFormData({ ...formData, nombre: v })}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,60}$"
              minLength={2}
              maxLength={60}
              autoComplete="off"
              required={true}
              validateMessage="Solo letras, espacios y algunos símbolos permitidos"
              placeholder="ej. Pequeño Jaguar"
              forceValidate={submitted}
            />
            <DropdownField
              label="Tipo *"
              value={formData.tipo}
              onChange={(v) =>
                setFormData({ ...formData, tipo: v as TipoAnimal })
              }
              options={["doméstico", "silvestre"]}
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Especie *"
              value={formData.especie}
              onChange={(v) => setFormData({ ...formData, especie: v })}
              options={["Felino", "Canino", "Ave", "Reptil", "Roedor", "Marsupial", "Anfibio", "Otro"]}
              required
              forceValidate={submitted}
            />
            <FormFieldWithError
              label="Raza *"
              value={formData.raza}
              onChange={(v) => setFormData({ ...formData, raza: v })}
              pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,60}$"
              minLength={2}
              maxLength={60}
              autoComplete="off"
              placeholder="ej. Jaguar"
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Sexo *"
              value={formData.sexo}
              onChange={(v) => setFormData({ ...formData, sexo: v })}
              options={["macho", "hembra"]}
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Estado de Salud *"
              value={formData.estadoSalud}
              onChange={(v) => setFormData({ ...formData, estadoSalud: v })}
              options={["muy bueno", "bueno", "estable", "malo", "muy malo"]}
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Tipo de Alimentación *"
              value={formData.tipoAlimentacion}
              onChange={(v) =>
                setFormData({ ...formData, tipoAlimentacion: v })
              }
              options={["Carnívoro", "Herbívoro", "Insectívoro", "Omnívoro"]}
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Cantidad Recomendada *"
              value={formData.cantidadRecomendada}
              onChange={(v) =>
                setFormData({ ...formData, cantidadRecomendada: v })
              }
              options={["100 g", "250 g", "500 g", "1 kg", "2 kg"]}
              required
              forceValidate={submitted}
            />
            <DropdownField
              label="Frecuencia Recomendada *"
              value={formData.frecuenciaRecomendada}
              onChange={(v) =>
                setFormData({ ...formData, frecuenciaRecomendada: v })
              }
              options={["Diaria", "Semanal", "Mensual"]}
              required
              forceValidate={submitted}
            />
            <div>
              <label className="block text-sm font-medium mb-1">
                Fecha de Rescate *
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
            <FormFieldWithError
              label="Ubicación del Rescate"
              value={formData.ubicacionRescate}
              onChange={(v) =>
                setFormData({ ...formData, ubicacionRescate: v })
              }
              minLength={3}
              maxLength={140}
              placeholder="ej. Av. Siempre Viva 742, Parque Central"
              required
              forceValidate={submitted}
            />
            {/* Coordenadas ocultas para usuario final */}
            <div className="flex items-center justify-between mt-2">
              <button
                type="button"
                onClick={() => setShowMapHelp(true)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-green-200 text-green-700 bg-white hover:bg-green-50 text-sm"
                aria-label="¿Cómo usar el mapa?"
                title="¿Cómo usar el mapa?"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0-9a3.75 3.75 0 0 0-3.75 3.75.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 3.014 2.124c-.81.27-1.514.843-1.919 1.582-.213.389-.345.84-.345 1.294v.25a.75.75 0 0 0 1.5 0v-.25c0-.248.062-.494.18-.711.22-.402.61-.73 1.087-.89A3.75 3.75 0 0 0 12 6.75Z" clipRule="evenodd" />
                </svg>
                <span>¿Cómo usar el mapa?</span>
              </button>
              <Button
                type="button"
                className="bg-green-600 text-white hover:bg-green-700 px-3 py-1 text-sm"
                onClick={requestCurrentLocation}
              >
                Usar mi ubicación
              </Button>
            </div>
            {/* Texto inline retirado; se usa MapHelpModal para ayuda completa */}
            <div id="add-animal-map" style={mapContainerStyle} className="rounded mt-2" />
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Foto del Animal (opcional):</label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (file && (file.type === 'image/webp' || /\.webp$/i.test(file.name))) {
                    setNotification({ type: 'error', message: 'Formato WEBP no soportado. Sube una imagen PNG o JPG.' });
                    e.currentTarget.value = '';
                    setImagenFile(null);
                    setImagenPreview('');
                    return;
                  }
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
            <div className="md:col-span-2 mt-2 flex justify-center">
              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700 px-8"
              >
                {isEditing ? "GUARDAR CAMBIOS" : "AGREGAR ANIMAL"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <MapHelpModal open={showMapHelp} onClose={() => setShowMapHelp(false)} />
    </div>
  );
};

// InputField ya no se usa (reemplazado por FormFieldWithError para mensajes), pero lo dejamos comentado si se necesita más adelante
/*
const InputField = ({
  label,
  value,
  onChange,
  pattern,
  minLength,
  maxLength,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
  placeholder?: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      pattern={pattern}
      minLength={minLength}
      maxLength={maxLength}
      autoComplete={autoComplete}
      placeholder={placeholder}
      className="w-full"
      required
    />
  </div>
);
*/

const DropdownField = ({
  label,
  value,
  onChange,
  options,
  required,
  forceValidate,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
  forceValidate?: boolean;
}) => {
  const showError = !!forceValidate && required && !String(value || '').trim();
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
        className={`w-full border rounded px-3 py-2 ${showError ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-400' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecciona una opción</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
      {showError && (
        <div className="text-amber-600 text-sm mt-1" role="alert">Este campo es obligatorio</div>
      )}
    </div>
  );
};
