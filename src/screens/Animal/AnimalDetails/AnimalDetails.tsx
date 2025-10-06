import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useThemeClasses } from "../../../hooks/useThemeClasses";
import { useEffect, useMemo, useRef, useState } from "react";
import { getAnimalById } from "../../../services/dataService";
import { getAllLiberations } from "../../../services/transferService";
import { getAllAdopciones, getAllAdoptions } from "../../../services/dataService";

interface AnimalDetailsProps {
  animal: {
    id: number;
    name: string;
    species: string;
    breed: string;
    sex: string;
    age: string;
    healthStatus: string;
    admissionDate: string;
    feedingType: string;
    recommendedAmount: string;
    recommendedFrequency: string;
    releaseDate: string;
    releaseLocation: string;
    image: string;
    tipo: string;
    rescuer?: {
      id: number;
      name: string;
      phone: string;
      rescueDate: string;
      rescueLocation: string;
    };
  };
  onClose: () => void;
  onEdit: () => void;
}

export const AnimalDetails = ({ animal, onClose, onEdit }: AnimalDetailsProps): JSX.Element => {
  const navigate = useNavigate();
  const { getThemeClasses } = useThemeClasses();
  const hasTreatment = false;
  const mapRef = useRef<any>(null);
  const [showMap, setShowMap] = useState(false);
  const [liberations, setLiberations] = useState<any[]>([]);
  const [adoptions, setAdoptions] = useState<any[]>([]);
  const [rescuePoint, setRescuePoint] = useState<{ lat: number; lng: number; desc?: string } | null>(null);
  const [showRescuerModal, setShowRescuerModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'Información General' | 'Ubicación' | 'Acciones'>('Información General');
  const addressCardRef = useRef<any>(null);
  const [mapHeight, setMapHeight] = useState<number>(280);

  const resolveImageSrc = (filename?: string | null) => {
    const fallback = "/imagenes/patita.png";
    if (!filename) return fallback;
    const clean = String(filename).trim();
    if (/^https?:\/\//i.test(clean)) return clean;
    if (clean.startsWith("/imagenes/")) return clean;
    const host = import.meta.env.VITE_BACK;
    const fileOnly = clean.split("/").pop() || clean;
    return `${host}/uploads/${fileOnly}`;
  };

  const formatDateDMY = (value?: string): string => {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  // Carga liberaciones/adopciones por nombre del animal
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const nombre = String(animal?.name || "").trim();
        if (!nombre) return;
        
        // Liberaciones
        try {
          const lr = await getAllLiberations();
          const ld = lr?.data; 
          const ll = Array.isArray(ld) ? ld : (ld?.postgres ?? []);
          if (alive) setLiberations(ll.filter((x: any) => {
            const n = String(x?.nombreAnimal || x?.animal?.nombre || x?.animal?.name || "").trim();
            return n === nombre;
          }));
        } catch { 
          if (alive) setLiberations([]); 
        }
        
        // Adopciones
        try {
          let ar: any; 
          try { 
            ar = await getAllAdoptions(); 
          } catch { 
            ar = await getAllAdopciones(); 
          }
          const ad = ar?.data; 
          const al = Array.isArray(ad) ? ad : (ad?.postgres ?? []);
          if (alive) setAdoptions(al.filter((x: any) => {
            const n = String(x?.nombreAnimal || x?.animal?.nombre || x?.animal?.name || "").trim();
            return n === nombre;
          }));
        } catch { 
          if (alive) setAdoptions([]); 
        }
      } catch { /* noop */ }
    })();
    return () => { alive = false; };
  }, [animal?.name]);

  // Fechas calculadas desde endpoints
  const toDate = (v?: any): Date | null => {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  };

  const latestLiberationDateStr = useMemo(() => {
    const ordered = (liberations || [])
      .map((x: any) => toDate(x?.fechaLiberacion || x?.fecha || x?.createdAt))
      .filter((d: any) => d instanceof Date) as Date[];
    if (!ordered.length) return "";
    ordered.sort((a, b) => a.getTime() - b.getTime());
    return ordered[ordered.length - 1].toLocaleString();
  }, [liberations]);

  const latestAdoptionDateStr = useMemo(() => {
    const approved = (adoptions || []).filter((x: any) => String(x?.estado || '').toLowerCase() === 'aprobada');
    const ordered = approved
      .map((x: any) => toDate(x?.fechaAdopcion || x?.fecha || x?.createdAt))
      .filter((d: any) => d instanceof Date) as Date[];
    if (!ordered.length) return "";
    ordered.sort((a, b) => a.getTime() - b.getTime());
    return ordered[ordered.length - 1].toLocaleString();
  }, [adoptions]);

  // Determinar si el animal está adoptado o liberado
  const isAdoptedOrLiberated = useMemo(() => {
    const hasAdoption = Boolean(latestAdoptionDateStr && latestAdoptionDateStr.trim() !== "");
    const hasLiberation = Boolean(latestLiberationDateStr && latestLiberationDateStr.trim() !== "");
    return hasAdoption || hasLiberation;
  }, [latestAdoptionDateStr, latestLiberationDateStr]);

  // Estado actual del animal
  const currentStatus = useMemo(() => {
    if (latestAdoptionDateStr && latestAdoptionDateStr.trim() !== "") {
      return { type: 'adopted', date: latestAdoptionDateStr, label: 'Adoptado' };
    }
    if (latestLiberationDateStr && latestLiberationDateStr.trim() !== "") {
      return { type: 'liberated', date: latestLiberationDateStr, label: 'Liberado' };
    }
    return { type: 'active', date: '', label: 'En cuidado' };
  }, [latestAdoptionDateStr, latestLiberationDateStr]);

  // Carga coordenadas reales de rescate del animal
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const full = await getAnimalById(String(animal.id));
        const lat = Number(full?.latitud ?? full?.geolocalizacion?.latitud);
        const lng = Number(full?.longitud ?? full?.geolocalizacion?.longitud);
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
          if (!alive) return;
          setRescuePoint({ 
            lat, 
            lng, 
            desc: full?.ubicacionRescate ?? full?.geolocalizacion?.descripcion 
          });
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, [animal.id]);

  // Dirección de rescate formateada
  const rescueAddress = useMemo(() => {
    const raw = String(rescuePoint?.desc || animal.rescuer?.rescueLocation || '').trim();
    return raw;
  }, [rescuePoint?.desc, animal.rescuer?.rescueLocation]);

  const addressParts = useMemo(() => {
    return rescueAddress
      ? rescueAddress.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
  }, [rescueAddress]);

  // Mostrar/ocultar mapa según la pestaña activa
  useEffect(() => {
    setShowMap(activeTab === 'Ubicación');
  }, [activeTab]);

  // Sincroniza la altura del mapa con el alto del card de dirección
  useEffect(() => {
    const el = addressCardRef.current as HTMLElement | null;
    if (!el) return;
    const compute = () => {
      try {
        const h = Math.max(200, Math.round(el.getBoundingClientRect().height));
        setMapHeight(h);
      } catch {}
    };
    compute();
    let ro: any;
    try {
      ro = new (window as any).ResizeObserver(() => compute());
      ro?.observe(el);
    } catch {}
    return () => { try { ro?.disconnect(); } catch {} };
  }, [activeTab]);

  // Asegura que el mapa recalcula tamaño cuando cambia la altura o se muestra
  useEffect(() => {
    try { mapRef.current?.invalidateSize(false); } catch {}
  }, [mapHeight, showMap]);

  // Inicializar/recargar el mapa solo con la ubicación de rescate
  useEffect(() => {
    if (!showMap) return;
    const L: any = (window as any).L;
    const container = document.getElementById('animal-location-map');
    if (!L || !container) return;

    const defaultCenter: [number, number] = [-17.7833, -63.1821];
    if (!mapRef.current) {
      mapRef.current = L.map('animal-location-map').setView(defaultCenter, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }

    // Limpiar marcadores anteriores
    mapRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
        mapRef.current.removeLayer(layer);
      }
    });

    // Añadir solo el punto de rescate
    if (rescuePoint) {
      const marker = L.circleMarker([rescuePoint.lat, rescuePoint.lng], {
        radius: 8,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.8,
        weight: 2,
      }).addTo(mapRef.current);
      marker.bindPopup(`<div class=\"text-sm\"><strong>Rescate: ${rescuePoint.desc || ''}</strong></div>`);
      try {
        mapRef.current.setView([rescuePoint.lat, rescuePoint.lng], 15);
      } catch {}
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [showMap, rescuePoint]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={getThemeClasses(
          "bg-white z-20 border-b border-gray-200 px-8 py-6",
          "bg-white z-20 border-b border-green-200 px-8 py-6"
        )}>
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
                <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-1">{animal.name}</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    animal.tipo === 'domestico' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {animal.tipo === 'domestico' ? 'Animal Doméstico' : 'Animal Silvestre'}
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">{animal.species}</span>
                  <span className="text-gray-500">•</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    currentStatus.type === 'adopted' 
                      ? 'bg-green-100 text-green-800' 
                      : currentStatus.type === 'liberated'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {currentStatus.label}
                    
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={onEdit}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido principal con tabs */}
        <div className="flex-1 overflow-hidden">
          {/* Tabs navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex px-8" aria-label="Tabs">
              {['Información General', 'Ubicación', 'Acciones'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Content area */}
          <div className="overflow-y-auto max-h-[65vh] px-8 py-6">

            {activeTab === 'Información General' && (
              <div className="space-y-8">
                {/* Fila 1: Información Básica + Imagen */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Información Básica
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-right font-semibold text-gray-600">Especie:</div>
                      <div className="text-gray-800">{animal.species}</div>

                      <div className="text-right font-semibold text-gray-600">Raza:</div>
                      <div className="text-gray-800">{animal.breed}</div>

                      <div className="text-right font-semibold text-gray-600">Sexo:</div>
                      <div className="text-gray-800">{animal.sex}</div>

                      <div className="text-right font-semibold text-gray-600">Estado de Salud:</div>
                      <div className="text-gray-800">{animal.healthStatus}</div>

                      <div className="text-right font-semibold text-gray-600">Fecha de Ingreso:</div>
                      <div className="text-gray-800">{formatDateDMY(animal.admissionDate)}</div>
                    </div>
                  </div>
                  <div className="w-full h-80 rounded-lg overflow-hidden flex items-center justify-center shadow-lg bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200">
                    <img 
                      src={resolveImageSrc(animal.image)} 
                      alt={animal.name} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                </div>

                {/* Fila 2: Alimentación + Estado Actual */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                      </svg>
                      Alimentación
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-right font-semibold text-gray-600">Tipo:</div>
                      <div className="text-gray-800">{animal.feedingType}</div>

                      <div className="text-right font-semibold text-gray-600">Cantidad:</div>
                      <div className="text-gray-800">{animal.recommendedAmount}</div>

                      <div className="text-right font-semibold text-gray-600">Frecuencia:</div>
                      <div className="text-gray-800">{animal.recommendedFrequency}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 w-full">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Estado Actual
                    </h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div className="text-right font-semibold text-gray-600">Tipo:</div>
                      <div className="text-gray-800">{animal.tipo === 'domestico' ? 'Doméstico' : 'Silvestre'}</div>

                      <div className="text-right font-semibold text-gray-600">Estado:</div>
                      <div className="text-gray-800">{animal.healthStatus}</div>

                      {animal.tipo === 'domestico' ? (
                        <>
                          <div className="text-right font-semibold text-gray-600">Fecha de Adopción:</div>
                          <div className="text-gray-800">{latestAdoptionDateStr || (animal.releaseDate ? formatDateDMY(animal.releaseDate) : 'Pendiente')}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-right font-semibold text-gray-600">Fecha de Liberación:</div>
                          <div className="text-gray-800">{latestLiberationDateStr || (animal.releaseDate ? formatDateDMY(animal.releaseDate) : 'Pendiente')}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Ubicación' && (
              <div className="space-y-6">
                {/* Sección de Ubicación */}
                <div className="mt-1">
                  <div className={getThemeClasses(
                    "bg-gray-50 p-6 rounded-lg",
                    "bg-green-50/50 p-6 rounded-lg border border-green-100"
                  )}>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Ubicación de Rescate
                      </h3>
                      <div />
                    </div>

                    {/* Dirección + Mapa en dos columnas */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                      <div ref={addressCardRef} className={getThemeClasses(
                        "p-4 border rounded-lg bg-white",
                        "p-4 border border-green-200 rounded-lg bg-white shadow-sm"
                      ) + " self-start"}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="font-semibold text-gray-800">Dirección de Rescate</span>
                        </div>
                        {rescueAddress ? (
                          <div className="text-sm text-gray-700 space-y-1">
                            {addressParts.length > 0 ? (
                              <ul className="list-disc list-inside space-y-1">
                                {addressParts.slice(0, 6).map((part, idx) => (
                                  <li key={idx} className="leading-relaxed">{part}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="leading-relaxed">{rescueAddress}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Sin dirección registrada.</p>
                        )}
                        {animal.rescuer?.name && (
                          <div className="mt-3 text-xs text-gray-500">Rescatado por: {animal.rescuer.name}</div>
                        )}
                      </div>

                      <div className="self-start w-full">
                        {showMap && (
                          <div>
                            <div 
                              id="animal-location-map" 
                              className={getThemeClasses(
                                "w-full rounded-lg border border-gray-200 relative z-0",
                                "w-full rounded-lg border border-green-200 relative z-0"
                              )}
                              style={{ height: mapHeight + 'px' }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Acciones' && (
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Primera fila de acciones */}
                  <Button 
                    className={getThemeClasses(
                      isAdoptedOrLiberated 
                        ? "bg-gray-400 text-gray-200 font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24",
                      isAdoptedOrLiberated 
                        ? "bg-gray-400 text-gray-200 font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24"
                    )}
                    onClick={() => !isAdoptedOrLiberated && navigate(`/medical-evaluation/${animal.id}`)}
                    disabled={isAdoptedOrLiberated}
                    title={isAdoptedOrLiberated ? `No disponible - Animal ${currentStatus.label.toLowerCase()}` : "Ver evaluaciones médicas"}
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-lg">Evaluaciones Médicas</span>
                      <span className="text-xs text-white/80">
                        {isAdoptedOrLiberated ? `${currentStatus.label} - No disponible` : "Ver historial médico"}
                      </span>
                    </div>
                  </Button>

                  <Button 
                    className={isAdoptedOrLiberated 
                      ? "bg-gray-400 text-gray-200 font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 shadow-md hover:shadow-lg active:shadow-sm transition-shadow"
                    }
                    onClick={() => !isAdoptedOrLiberated && navigate(`/geolocation/${animal.id}`)}
                    disabled={isAdoptedOrLiberated}
                    title={isAdoptedOrLiberated ? `No disponible - Animal ${currentStatus.label.toLowerCase()}` : "Agregar nueva ubicación"}
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-lg">Ubicación</span>
                      <span className="text-xs text-white/80">
                        {isAdoptedOrLiberated ? `${currentStatus.label} - No disponible` : "Gestionar ubicaciones"}
                      </span>
                    </div>
                  </Button>

                  <Button 
                    className={getThemeClasses(
                      "bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24",
                      "bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24"
                    )}
                    onClick={() => navigate(`/transfer-history/${animal.id}`)}
                    title="Ver historial de traslados"
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-lg">Traslados</span>
                      <span className="text-xs text-white/80">Historial de movimientos</span>
                    </div>
                  </Button>

                  {/* Segunda fila de acciones */}
                  <Button 
                    onClick={() => !isAdoptedOrLiberated && navigate(`/medical-treatment/${animal.id}`)}
                    className={getThemeClasses(
                      isAdoptedOrLiberated 
                        ? "bg-gray-400 text-gray-200 font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 cursor-not-allowed"
                        : "bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24",
                      isAdoptedOrLiberated 
                        ? "bg-gray-400 text-gray-200 font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24 cursor-not-allowed"
                        : "bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24"
                    )}
                    disabled={isAdoptedOrLiberated}
                    title={isAdoptedOrLiberated ? `No disponible - Animal ${currentStatus.label.toLowerCase()}` : "Gestionar tratamientos médicos"}
                  >
                    <div className="p-2 bg-white/10 rounded-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-lg">Tratamiento</span>
                      <span className="text-xs text-white/80">
                        {isAdoptedOrLiberated ? `${currentStatus.label} - No disponible` : (hasTreatment ? 'Ver tratamiento actual' : 'Nuevo tratamiento')}
                      </span>
                    </div>
                  </Button>

                  {animal.rescuer && (
                    <Button
                      className={getThemeClasses(
                        "bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24",
                        "bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl w-full flex items-center gap-3 p-4 h-24"
                      )}
                      onClick={() => setShowRescuerModal(true)}
                    >
                      <div className="p-2 bg-white/10 rounded-lg">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="text-lg">Rescatista</span>
                        <span className="text-xs text-white/80">Ver información</span>
                      </div>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rescuer Modal */}
        {showRescuerModal && animal.rescuer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[120] p-4 overflow-y-auto">
            <div className={getThemeClasses(
              "bg-white rounded-lg w-full max-w-md p-6 shadow-2xl",
              "bg-white rounded-lg w-full max-w-md p-6 shadow-2xl border border-green-200"
            )}>
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800">
                    Información del Rescatista
                  </h4>
                  <button 
                    onClick={() => setShowRescuerModal(false)} 
                    className="text-gray-500 hover:text-gray-700" 
                    aria-label="Cerrar"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex">
                    <span className="w-40 font-medium">Nombre:</span>
                    <span>{animal.rescuer.name || '-'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-40 font-medium">Teléfono:</span>
                    <span>{animal.rescuer.phone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};