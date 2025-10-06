import React, { useState } from "react";
import { Button } from "../../../components/ui/button";
// import { Input } from "../../../components/ui/input";
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

const mapContainerStyle = { width: "100%", height: "220px" } as const;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Validaciones de campos obligatorios (evita tooltips nativos y muestra inline)
    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,60}$/;
    const textRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s.'-]{2,60}$/;

    const invalidFields = [
      !nameRegex.test(String(formData.nombre || "")),
      !String(formData.tipo || "").trim(),
      !String(formData.especie || "").trim(),
      !textRegex.test(String(formData.raza || "")),
      !String(formData.sexo || "").trim(),
      !String(formData.estadoSalud || "").trim(),
      !String(formData.tipoAlimentacion || "").trim(),
      !String(formData.cantidadRecomendada || "").trim(),
      !String(formData.frecuenciaRecomendada || "").trim(),
      !String(formData.fechaRescate || "").trim(),
      !(String(formData.ubicacionRescate || "").trim().length >= 3),
    ].some(Boolean);

    if (invalidFields) {
      // Desplazar y enfocar el primer campo inválido dentro del modal
      // Try inputs first (built with FormFieldWithError - ids are slugified labels)
      const inputIds = [
        'field-nombre',
        'field-raza',
        'field-fecha-de-rescate',
        'field-ubicación-del-rescate',
      ];
      let target: HTMLElement | null = null;
      for (const id of inputIds) {
        const el = document.getElementById(id);
        if (el && el.getAttribute('aria-invalid') === 'true') { target = el as HTMLElement; break; }
      }
      // If not found, check selects showing amber error (data-invalid set below)
      if (!target) {
        const firstInvalidSelect = document.querySelector('select[data-invalid="true"]') as HTMLElement | null;
        if (firstInvalidSelect) target = firstInvalidSelect;
      }
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try { (target as HTMLInputElement).focus(); } catch {}
      }
      return;
    }
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
      alert("Hubo un problema al registrar el animal.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header mejorado con gradiente y mejor jerarquía */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose} 
                className="p-3 rounded-2xl hover:bg-white/60 transition-all duration-200 group shadow-sm"
                aria-label="Cerrar formulario"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-gray-800 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">
                  {isEditing ? "Editar Animal" : "Agregar Animal"}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full border border-green-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Campos obligatorios marcados con *
                  </span>
                  {selectedRescuer && (
                    <span className="bg-white/80 px-3 py-1 rounded-full border border-blue-200 text-blue-700">
                      Rescatista: {selectedRescuer.nombre}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido del formulario */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 py-6"
            noValidate
          >
            {/* Card 1: Información Básica (fila 1, col 1) */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-sm min-h-[520px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
                </div>
                
                <div className="space-y-4 flex-1">
                  <FormFieldWithError
                    label="Nombre "
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
                    onChange={(v) => setFormData({ ...formData, tipo: v as TipoAnimal })}
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
                </div>
              </div>
            {/* Card 2: Información del Rescate (fila 1, col 2) */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-200 shadow-sm min-h-[520px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Información del Rescate</h3>
                </div>
                
                <div className="space-y-4 flex-1">
                  <FormFieldWithError
                    label="Fecha de Rescate "
                    value={formData.fechaRescate}
                    onChange={(v) => setFormData({ ...formData, fechaRescate: v })}
                    type="date"
                    required
                    max={today}
                    forceValidate={submitted}
                  />
                  
                  <FormFieldWithError
                    label="Ubicación del Rescate "
                    value={formData.ubicacionRescate}
                    onChange={(v) => setFormData({ ...formData, ubicacionRescate: v })}
                    minLength={3}
                    maxLength={140}
                    placeholder="ej. Av. Siempre Viva 742, Parque Central"
                    required
                    forceValidate={submitted}
                  />

                  {/* Mapa Mejorado */}
                  <div className="space-y-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-gray-700">
                        Ubicación en el mapa *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowMapHelp(true)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 text-sm transition-all duration-200 hover:shadow-md"
                          aria-label="¿Cómo usar el mapa?"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm0 13.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Zm0-9a3.75 3.75 0 0 0-3.75 3.75.75.75 0 0 0 1.5 0 2.25 2.25 0 1 1 3.014 2.124c-.81.27-1.514.843-1.919 1.582-.213.389-.345.84-.345 1.294v.25a.75.75 0 0 0 1.5 0v-.25c0-.248.062-.494.18-.711.22-.402.61-.73 1.087-.89A3.75 3.75 0 0 0 12 6.75Z" clipRule="evenodd" />
                          </svg>
                          <span>Ayuda</span>
                        </button>
                        <Button
                          type="button"
                          className="bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
                          onClick={requestCurrentLocation}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Mi ubicación
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-[200px]">
                      <div 
                        id="add-animal-map" 
                        style={mapContainerStyle} 
                        className="rounded-xl border-2 border-gray-200 shadow-inner overflow-hidden h-full"
                      />
                    </div>
                    
                    {(!formData.latitud || !formData.longitud) && submitted && (
                      <div className="flex items-center gap-2 text-amber-600 text-sm bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Selecciona una ubicación en el mapa
                      </div>
                    )}
                  </div>
                </div>
              </div>
            {/* Card 3: Salud y Cuidados (fila 2, col 1) */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200 shadow-sm min-h-[520px] flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Salud y Cuidados</h3>
              </div>
              
              <div className="space-y-4 flex-1">
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
                  onChange={(v) => setFormData({ ...formData, tipoAlimentacion: v })}
                  options={["Carnívoro", "Herbívoro", "Insectívoro", "Omnívoro"]}
                  required
                  forceValidate={submitted}
                />
                
                <DropdownField
                  label="Cantidad Recomendada *"
                  value={formData.cantidadRecomendada}
                  onChange={(v) => setFormData({ ...formData, cantidadRecomendada: v })}
                  options={["100 g", "250 g", "500 g", "1 kg", "2 kg"]}
                  required
                  forceValidate={submitted}
                />
                
                <DropdownField
                  label="Frecuencia Recomendada *"
                  value={formData.frecuenciaRecomendada}
                  onChange={(v) => setFormData({ ...formData, frecuenciaRecomendada: v })}
                  options={["Diaria", "Semanal", "Mensual"]}
                  required
                  forceValidate={submitted}
                />
                
                <div className="flex-1"></div>
              </div>
            </div>

            {/* Card 4: Multimedia (fila 2, col 2) */}
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-sm min-h-[520px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-pink-100 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Multimedia</h3>
                </div>

                <div className="space-y-4 flex-1 flex flex-col">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Foto del Animal
                      <span className="text-gray-500 font-normal ml-1">(Opcional)</span>
                    </label>
                    
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center transition-all duration-300 hover:border-green-400 hover:bg-green-50/50 group cursor-pointer h-[380px] flex items-center justify-center">                      <input
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
                        className="hidden"
                        id="animal-photo"
                      />
                      
                      <label htmlFor="animal-photo" className="cursor-pointer block w-full h-full flex items-center justify-center">
                        {imagenPreview ? (
                          <div className="flex flex-col items-center space-y-3">
                            <div className="relative">
                              <img 
                                src={imagenPreview} 
                                alt="Vista previa" 
                                className="h-40 w-40 object-cover rounded-2xl shadow-lg border-2 border-green-200" 
                              />
                              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 rounded-2xl transition-all duration-200 flex items-center justify-center">
                                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                  Cambiar foto
                                </span>
                              </div>
                            </div>
                            <span className="text-sm text-green-600 font-medium">
                              Foto seleccionada ✓
                            </span>
                          </div>
                        ) : (
                          <div className="py-6 space-y-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto group-hover:text-green-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <div>
                              <p className="text-sm text-gray-600 font-medium">
                                <span className="text-green-600">Click para subir</span> o arrastra una imagen
                              </p>
                              <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG</p>
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              </div>

            {/* Botón de envío */}
            <div className="lg:col-span-2 flex justify-center pt-2">
              <Button
                type="submit"
                className="bg-green-600 text-white hover:bg-green-700 px-12 py-4 text-lg shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
              >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {isEditing ? "Guardar Cambios" : "Agregar Animal"}
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

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

// Componente DropdownField mejorado
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
    <div className="transform transition-all duration-200 hover:scale-[1.01]">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <select
          className={`w-full border rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:shadow-md ${
            showError 
              ? 'border-amber-400 focus:border-amber-400 focus:ring-amber-400 bg-amber-50' 
              : 'border-gray-300 focus:border-green-500 focus:ring-green-500 hover:border-gray-400'
          } appearance-none bg-white`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          data-invalid={showError ? 'true' : undefined}
        >
          <option value="" className="text-gray-400">Selecciona una opción</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-gray-900">
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {showError && (
        <div className="text-amber-600 text-sm mt-2 flex items-center gap-2 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Este campo es obligatorio
        </div>
      )}
    </div>
  );
};